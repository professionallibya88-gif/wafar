import argparse
import os
import time

import requests


def main():
    parser = argparse.ArgumentParser(
        description='اختبار واجهة استخراج الجداول')
    parser.add_argument('file_path', help='مسار ملف PDF المراد اختباره')
    parser.add_argument(
        '--url',
        default=os.environ.get(
            'PYTHON_SERVICE_URL',
            'http://127.0.0.1:5051') +
        '/extract-tables',
        help='رابط نقطة نهاية الخدمة',
    )
    args = parser.parse_args()

    print(f"Testing API with {args.file_path}")
    start = time.time()

    with open(args.file_path, 'rb') as file_handle:
        files = {'file': file_handle}
        response = requests.post(args.url, files=files, timeout=60)

    end = time.time()
    print(f"Request took {end - start:.2f} seconds")

    if response.status_code == 200:
        data = response.json()
        tables = data.get('tables', [])
        print(f"API returned {data.get('count')} tables.")
        if tables:
            table = tables[0]
            print(
                f"Table 0 has {table.get('row_count')} rows and {table.get('col_count')} columns.")
            print(f"Headers: {table.get('headers')}")
            print('First row:', table.get('rows')[0])
    else:
        print(
            f"API failed with status {response.status_code}: {response.text}")


if __name__ == '__main__':
    main()
