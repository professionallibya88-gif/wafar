import argparse

from table_extractor import TableExtractor


def main():
    parser = argparse.ArgumentParser(
        description='اختبار استخراج الجداول محلياً')
    parser.add_argument('file_path', help='مسار ملف PDF المراد اختباره')
    args = parser.parse_args()

    extractor = TableExtractor()
    tables = extractor.extract(args.file_path)
    print(f"Extracted {len(tables)} valid tables.")
    if tables:
        print("\n--- First Table ---")
        print('Headers:', tables[0]['headers'])
        print('First row:', tables[0]['rows'][0])


if __name__ == '__main__':
    main()
