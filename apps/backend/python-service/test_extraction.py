import unittest
from unittest.mock import MagicMock, patch
from table_extractor import TableExtractor


class TestTableExtractor(unittest.TestCase):
    @patch('table_extractor.fitz.open')
    def test_extract_no_column_shift(self, mock_fitz_open):
        # Setup mock document
        mock_doc = MagicMock()
        mock_page = MagicMock()
        mock_doc.__iter__.return_value = [mock_page]

        mock_table = MagicMock()
        # Mock table.extract() returning a list of rows
        # 5 columns originally, but column index 2 is entirely empty in all
        # rows
        mock_table.extract.return_value = [
            ['رقم القطعة', 'اسم القطعة', '', 'السعر', 'الكمية'],
            ['123', 'فلتر زيت', '', '50', '10'],
            ['124', 'فلتر هواء', '', '40', '5'],
            ['', '', '', '', ''],
            ['125', 'بوجيهات', '', '100', '20']
        ]
        mock_page.find_tables.return_value = [mock_table]
        mock_fitz_open.return_value = mock_doc

        extractor = TableExtractor()
        # Mocking internal methods that handle Arabic string reversal so test
        # logic is straightforward
        extractor._is_part_table = MagicMock(return_value=True)
        extractor._clean = lambda x: str(x).strip() if x is not None else ''

        result = extractor.extract("dummy.pdf")

        self.assertEqual(len(result), 1, "Should extract one table")
        table = result[0]

        # We dropped column index 2. Expect 4 columns.
        expected_headers = ['رقم القطعة', 'اسم القطعة', 'السعر', 'الكمية']
        self.assertEqual(
            table['headers'],
            expected_headers,
            "Headers should be filtered to match valid columns")

        self.assertEqual(len(table['rows']), 3,
                         "Should have 3 data rows (empty row dropped)")
        self.assertEqual(len(table['rows'][0]), 4,
                         "Each row should have exactly 4 columns")
        self.assertEqual(
            table['rows'][0], [
                '123', 'فلتر زيت', '50', '10'], "Data should not shift into dropped columns")


if __name__ == '__main__':
    unittest.main()
