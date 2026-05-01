import unittest
import pandas as pd
from unittest.mock import patch, MagicMock
from table_extractor import PdfPlumberExtractor, CamelotExtractor


class TestTableExtractors(unittest.TestCase):

    def test_pdfplumber_empty_column_handling(self):
        # We want to test that empty columns are correctly dropped and headers
        # are aligned

        # Simulate a table where the second column is entirely empty
        raw_table = [
            ["كود القطعة", "", "اسم القطعة", "السعر"],
            ["12345", "", "فلتر زيت", "15.0"],
            ["67890", "", "بواجي", "25.5"]
        ]

        # We can bypass the PDF reading and just test the cleaning logic
        headers = raw_table[0]
        all_data = raw_table[1:]

        df = pd.DataFrame(all_data)
        df = df.replace('', pd.NA).dropna(how='all', axis=1)
        valid_cols = df.columns.tolist()
        df = df.fillna('')

        filtered_headers = []
        for col_idx in valid_cols:
            if isinstance(col_idx, int) and col_idx < len(headers):
                filtered_headers.append(headers[col_idx])
            else:
                filtered_headers.append('')

        # Verify
        self.assertEqual(len(filtered_headers), 3)
        self.assertEqual(
            filtered_headers, [
                "كود القطعة", "اسم القطعة", "السعر"])
        self.assertEqual(df.shape[1], 3)

    @patch('pdfplumber.open')
    def test_pdfplumber_extraction_flow(self, mock_pdfplumber_open):
        mock_pdf = MagicMock()
        mock_page = MagicMock()
        mock_page.extract_tables.return_value = [
            [
                ["كود القطعة", "", "اسم القطعة", "السعر"],
                ["12345", "", "فلتر زيت", "15.0"],
                ["67890", "", "بواجي", "25.5"]
            ]
        ]
        mock_pdf.pages = [mock_page]

        mock_pdf_context = MagicMock()
        mock_pdf_context.__enter__.return_value = mock_pdf
        mock_pdfplumber_open.return_value = mock_pdf_context

        extractor = PdfPlumberExtractor()
        extractor._is_part_table = MagicMock(return_value=True)
        extractor._clean = lambda x: str(x).strip() if x is not None else ''
        result = extractor.extract("dummy.pdf")

        self.assertTrue(len(result) > 0)
        self.assertEqual(result[0]['method'], 'pdfplumber')
        self.assertEqual(result[0]['col_count'], 3)
        self.assertEqual(
            result[0]['headers'], [
                "كود القطعة", "اسم القطعة", "السعر"])
        self.assertEqual(result[0]['rows'], [
                         ["12345", "فلتر زيت", "15.0"], ["67890", "بواجي", "25.5"]])

    @patch('camelot.read_pdf')
    def test_camelot_extraction_flow(self, mock_camelot_read_pdf):
        mock_table = MagicMock()
        mock_table.df = pd.DataFrame([
            ["كود القطعة", "", "اسم القطعة", "السعر"],
            ["12345", "", "فلتر زيت", "15.0"],
            ["67890", "", "بواجي", "25.5"]
        ])

        # camelot returns a list-like TableList object
        mock_camelot_read_pdf.return_value = [mock_table]

        extractor = CamelotExtractor()
        extractor._is_part_table = MagicMock(return_value=True)
        extractor._clean = lambda x: str(x).strip() if x is not None else ''
        result = extractor.extract("dummy.pdf", flavor='lattice')

        self.assertTrue(len(result) > 0)
        self.assertEqual(result[0]['method'], 'camelot_lattice')
        self.assertEqual(result[0]['col_count'], 3)
        self.assertEqual(
            result[0]['headers'], [
                "كود القطعة", "اسم القطعة", "السعر"])
        self.assertEqual(result[0]['rows'], [
                         ["12345", "فلتر زيت", "15.0"], ["67890", "بواجي", "25.5"]])


if __name__ == '__main__':
    unittest.main()
