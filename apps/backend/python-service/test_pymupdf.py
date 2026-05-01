import argparse
import time

from table_extractor import TableExtractor


def main():
    parser = argparse.ArgumentParser(
        description='اختبار محرك PyMuPDF لاستخراج الجداول')
    parser.add_argument('file_path', help='مسار ملف PDF المراد اختباره')
    args = parser.parse_args()

    print(f"Testing extraction on {args.file_path}")

    extractor = TableExtractor()
    start = time.time()
    tables = extractor.extract(args.file_path)
    end = time.time()

    if tables:
        t = tables[0]
        print(
            f"Extracted {t['row_count']} rows and {t['col_count']} columns in {end - start:.2f} seconds.")
        print(f"Headers: {t['headers']}")
        print(f"Rows 15 to 20:")
        for r in t['rows'][15:20]:
            print(r)
    else:
        print("No tables extracted or failed.")


if __name__ == '__main__':
    main()
