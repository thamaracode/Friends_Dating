import zipfile
import xml.etree.ElementTree as ET
import json
import csv
import os

def parse_xlsx(file_path):
    print(f"Parsing: {file_path}")
    with zipfile.ZipFile(file_path, 'r') as z:
        # 1. Parse shared strings
        shared_strings = []
        if 'xl/sharedStrings.xml' in z.namelist():
            tree = ET.fromstring(z.read('xl/sharedStrings.xml'))
            ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
            for si in tree.findall('main:si', ns):
                text_parts = [t.text for t in si.findall('.//main:t', ns) if t.text]
                shared_strings.append(''.join(text_parts))
        print(f"Shared strings: {len(shared_strings)}")

        # 2. Parse sheet1.xml
        sheet_tree = ET.fromstring(z.read('xl/worksheets/sheet1.xml'))
        ns = {'main': 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
        sheet_data = sheet_tree.find('main:sheetData', ns)
        
        rows_data = []
        for row in sheet_data.findall('main:row', ns):
            row_idx = row.get('r')
            row_cells = {}
            max_col_idx = 0
            for c in row.findall('main:c', ns):
                cell_ref = c.get('r') # e.g. A1, B1, AA1
                # calculate col index from letters
                col_letters = ''.join([ch for ch in cell_ref if ch.isalpha()])
                col_num = 0
                for char in col_letters:
                    col_num = col_num * 26 + (ord(char.upper()) - ord('A') + 1)
                
                cell_type = c.get('t')
                val_node = c.find('main:v', ns)
                val = val_node.text if val_node is not None else None
                
                if cell_type == 's' and val is not None:
                    str_idx = int(val)
                    val = shared_strings[str_idx] if str_idx < len(shared_strings) else val
                elif cell_type == 'inlineStr':
                    is_node = c.find('main:is', ns)
                    if is_node is not None:
                        t_node = is_node.find('main:t', ns)
                        val = t_node.text if t_node is not None else val
                
                row_cells[col_num] = val
                if col_num > max_col_idx:
                    max_col_idx = col_num
            
            # dense list for row
            row_list = [row_cells.get(i, '') for i in range(1, max_col_idx + 1)]
            rows_data.append(row_list)
        
        print(f"Total rows parsed: {len(rows_data)}")
        if rows_data:
            print(f"Headers count: {len(rows_data[0])}")
            print(f"First 10 headers:")
            for idx, h in enumerate(rows_data[0][:15], 1):
                print(f"  Col {idx}: {h}")
        return rows_data

if __name__ == '__main__':
    for fname in ['Book.xlsx', 'Book 2.xlsx']:
        p = os.path.join(r'c:\Users\Work\Desktop\Friends_Dating\research\raw_data', fname)
        if os.path.exists(p):
            rows = parse_xlsx(p)
            print("-" * 60)
