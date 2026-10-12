import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

DOC_NAME = "CyberShield-AI_Project_Report_v2.docx"

# Color constants
COLOR_PRIMARY_BLUE = RGBColor(43, 108, 176)   # #2B6CB0 Indus Academic Blue
COLOR_HEX_BLUE = "2B6CB0"
COLOR_HEX_ALT_ROW = "F7FAFC"
COLOR_HEX_BORDER = "CBD5E1"
COLOR_GRAY = RGBColor(113, 113, 122)         # #71717A Footer Gray
COLOR_DARK_TEXT = RGBColor(15, 23, 42)       # #0F172A Body Dark Slate

def create_report():
    doc = docx.Document()
    
    # -------------------------------------------------------------
    # Page Setup (A4, 1-inch margins)
    # -------------------------------------------------------------
    for s in doc.sections:
        s.page_width = Inches(8.27)
        s.page_height = Inches(11.69)
        s.top_margin = Inches(1.0)
        s.bottom_margin = Inches(1.0)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(1.0)
        
        # Configure Footer
        footer = s.footer
        p_ft = footer.paragraphs[0]
        p_ft.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p_ft.paragraph_format.space_before = Pt(0)
        p_ft.paragraph_format.space_after = Pt(0)
        r_ft = p_ft.add_run("CyberShield-AI – AI-Powered Cyber Threat Intelligence Platform")
        r_ft.font.name = "Times New Roman"
        r_ft.font.size = Pt(9)
        r_ft.font.color.rgb = COLOR_GRAY

    # Set normal style font to Times New Roman
    style_normal = doc.styles['Normal']
    style_normal.font.name = 'Times New Roman'
    style_normal.font.size = Pt(12)
    style_normal.font.color.rgb = COLOR_DARK_TEXT

    # -------------------------------------------------------------
    # XML Formatting Helpers for Tables
    # -------------------------------------------------------------
    def set_cell_background(cell, hex_color):
        shading = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>')
        cell._tc.get_or_add_tcPr().append(shading)

    def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = parse_xml(
            f'<w:tcMar {nsdecls("w")}>'
            f'<w:top w:w="{top}" w:type="dxa"/>'
            f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
            f'<w:left w:w="{left}" w:type="dxa"/>'
            f'<w:right w:w="{right}" w:type="dxa"/>'
            f'</w:tcMar>'
        )
        tcPr.append(tcMar)

    def set_table_borders(table, hex_color=COLOR_HEX_BORDER):
        tblPr = table._tbl.tblPr
        borders = parse_xml(
            f'<w:tblBorders {nsdecls("w")}>'
            f'<w:top w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'<w:left w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'<w:bottom w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'<w:right w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'<w:insideH w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'<w:insideV w:val="single" w:sz="4" w:space="0" w:color="{hex_color}"/>'
            f'</w:tblBorders>'
        )
        tblPr.append(borders)

    def format_table(table, col_widths, headers, rows_data):
        table.alignment = WD_TABLE_ALIGNMENT.CENTER
        set_table_borders(table)
        
        # Header Row
        hdr_row = table.rows[0]
        hdr_tr = hdr_row._tr.get_or_add_trPr()
        hdr_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        hdr_tr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
        
        for idx, text in enumerate(headers):
            cell = hdr_row.cells[idx]
            cell.width = col_widths[idx]
            set_cell_background(cell, COLOR_HEX_BLUE)
            set_cell_margins(cell, top=140, bottom=140, left=140, right=140)
            cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
            p = cell.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_before = Pt(0)
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(text)
            r.font.name = "Times New Roman"
            r.font.size = Pt(10.5)
            r.font.bold = True
            r.font.color.rgb = RGBColor(255, 255, 255)

        # Data Rows
        for r_idx, row_data in enumerate(rows_data):
            row = table.rows[r_idx + 1]
            trPr = row._tr.get_or_add_trPr()
            trPr.append(parse_xml(f'<w:cantSplit {nsdecls("w")}/>'))
            bg_color = COLOR_HEX_ALT_ROW if (r_idx % 2 == 1) else "FFFFFF"
            for c_idx, val in enumerate(row_data):
                cell = row.cells[c_idx]
                cell.width = col_widths[c_idx]
                if bg_color != "FFFFFF":
                    set_cell_background(cell, bg_color)
                set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
                cell.vertical_alignment = WD_ALIGN_VERTICAL.CENTER
                p = cell.paragraphs[0]
                # Center align if short or first col
                if c_idx == 0 and len(val) < 15:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                elif c_idx == len(row_data) - 1 and len(val) <= 6:
                    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
                else:
                    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_before = Pt(0)
                p.paragraph_format.space_after = Pt(0)
                r = p.add_run(val)
                r.font.name = "Times New Roman"
                r.font.size = Pt(10)
                r.font.color.rgb = COLOR_DARK_TEXT

    # -------------------------------------------------------------
    # Paragraph & Text Formatting Helpers
    # -------------------------------------------------------------
    def add_chapter_header(chap_num, chap_title, bullet_items):
        p_num = doc.add_paragraph()
        p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_num.paragraph_format.space_before = Pt(14)
        p_num.paragraph_format.space_after = Pt(4)
        r_num = p_num.add_run(f"CHAPTER {chap_num}")
        r_num.font.name = "Times New Roman"
        r_num.font.size = Pt(18)
        r_num.font.bold = True
        
        p_tit = doc.add_paragraph()
        p_tit.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_tit.paragraph_format.space_before = Pt(0)
        p_tit.paragraph_format.space_after = Pt(16)
        r_tit = p_tit.add_run(chap_title.upper())
        r_tit.font.name = "Times New Roman"
        r_tit.font.size = Pt(18)
        r_tit.font.bold = True

        for b in bullet_items:
            pb = doc.add_paragraph()
            pb.paragraph_format.space_before = Pt(0)
            pb.paragraph_format.space_after = Pt(3)
            pb.paragraph_format.left_indent = Inches(0.2)
            rb = pb.add_run(f"●  {b.upper()}")
            rb.font.name = "Times New Roman"
            rb.font.size = Pt(12)
            rb.font.bold = True

        # Spacer after bullets
        p_sp = doc.add_paragraph()
        p_sp.paragraph_format.space_before = Pt(6)
        p_sp.paragraph_format.space_after = Pt(6)

    def add_h2(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(14)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(title)
        r.font.name = "Times New Roman"
        r.font.size = Pt(14)
        r.font.bold = True

    def add_h3(title):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(10)
        p.paragraph_format.space_after = Pt(3)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(title)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)
        r.font.bold = True

    def add_p(text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(6)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(text)
        r.font.name = "Times New Roman"
        r.font.size = Pt(12)

    def add_bullet(bold_prefix, text):
        p = doc.add_paragraph()
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(4)
        p.paragraph_format.left_indent = Inches(0.25)
        p.paragraph_format.line_spacing = 1.15
        r_b = p.add_run(f"• {bold_prefix}: ")
        r_b.font.name = "Times New Roman"
        r_b.font.size = Pt(11.5)
        r_b.font.bold = True
        r_t = p.add_run(text)
        r_t.font.name = "Times New Roman"
        r_t.font.size = Pt(11.5)

    def add_figure(img_path, caption_text, width=Inches(5.8)):
        if os.path.exists(img_path):
            p_img = doc.add_paragraph()
            p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_img.paragraph_format.space_before = Pt(8)
            p_img.paragraph_format.space_after = Pt(4)
            p_img.paragraph_format.keep_with_next = True
            run_img = p_img.add_run()
            run_img.add_picture(img_path, width=width)
            
            p_cap = doc.add_paragraph()
            p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p_cap.paragraph_format.space_before = Pt(2)
            p_cap.paragraph_format.space_after = Pt(8)
            p_cap.paragraph_format.keep_with_next = True
            r_cap = p_cap.add_run(caption_text)
            r_cap.font.name = "Times New Roman"
            r_cap.font.size = Pt(10.5)
            r_cap.font.bold = True
            r_cap.font.italic = True

    # =============================================================
    # PAGE 1: TITLE / COVER PAGE
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("PROJECT REPORT\nON")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(14)
    r = p.add_run("CyberShield-AI: AI-Powered Cyber Threat Intelligence, Detection, Analysis and Attack Prediction Platform")
    r.font.name = "Times New Roman"
    r.font.size = Pt(17)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("Submitted by")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.italic = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(14)
    r = p.add_run(
        "Yash Raj (IU2341220107)\n"
        "Ganesh Kondekar (IU2341220102)\n"
        "Jeet Borse (IU231220139)\n"
        "Bhavya Vaidya (IU2341220099)\n"
        "Shiven Asopa (IU2341220142)"
    )
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("In fulfillment for the award of the degree\nOf")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.italic = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("BACHELOR OF TECHNOLOGY")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.italic = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("In\nInformation Technology")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True
    r.font.italic = True

    # Indus University Logo
    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(10)
    p_logo.paragraph_format.space_after = Pt(10)
    r_logo = p_logo.add_run()
    r_logo.add_picture("scratch/pdf_images/page_1_0_Image13.png", width=Inches(2.5))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("INSTITUTE OF TECHNOLOGY AND ENGINEERING\n"
                  "INDUS UNIVERSITY CAMPUS, RANCHARDA, VIA-THALTEJ\n"
                  "AHMEDABAD-382115, GUJARAT, INDIA\n"
                  "WEB: www.indusuni.ac.in\n"
                  "September-2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)
    r.font.bold = True

    doc.add_page_break()

    # =============================================================
    # PAGE 2: INNER TITLE PAGE
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("PROJECT REPORT\nON")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("CyberShield-AI: Civic & Enterprise Cyber Threat Intelligence, Detection, Analysis and Attack Prediction Platform")
    r.font.name = "Times New Roman"
    r.font.size = Pt(16)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(6)
    r = p.add_run("AT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(4)
    p_logo.paragraph_format.space_after = Pt(8)
    r_logo = p_logo.add_run()
    r_logo.add_picture("scratch/pdf_images/page_1_0_Image13.png", width=Inches(2.3))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("In the fulfilment of the requirement\nfor the degree of\nBachelor of Technology\nin\nInformation Technology")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.italic = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("PREPARED BY")
    r.font.name = "Times New Roman"
    r.font.size = Pt(13)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(8)
    r = p.add_run(
        "Yash Raj (IU2341220107)\n"
        "Ganesh Kondekar (IU2341220102)\n"
        "Jeet Borse (IU231220139)\n"
        "Bhavya Vaidya (IU2341220099)\n"
        "Shiven Asopa (IU2341220142)"
    )
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("UNDER GUIDANCE OF\nInternal Guide\nSheatal Panchal\nAssistant Professor\nDepartment of Information Technology,\nI.I.T.E. Indus University,\nAhmedabad")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    r = p.add_run("SUBMITTED TO\n"
                  "INSTITUTE OF TECHNOLOGY AND ENGINEERING\n"
                  "INDUS UNIVERSITY CAMPUS, RANCHARDA, VIA-THALTEJ\n"
                  "AHMEDABAD-382115, GUJARAT, INDIA\n"
                  "WEB: www.indusuni.ac.in\n"
                  "September-2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(10.5)
    r.font.bold = True

    doc.add_page_break()

    # =============================================================
    # PAGE 3: CANDIDATE'S DECLARATION
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run("CANDIDATE'S DECLARATION")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    add_p("We declare that final semester report entitled \"CyberShield-AI: AI-Powered Cyber Threat Intelligence, Detection, Analysis and Attack Prediction Platform\" is our own work conducted under the supervision of the guide Ms. Sheatal Panchal.")
    add_p("We further declare that to the best of my knowledge, the report for B. Tech final semester does not contain part of the work which has been submitted for the award of B. Tech Degree either in this university or any other university without proper citation.")

    candidates = [
        "Yash Raj (IU2341220107)",
        "Ganesh Kondekar (IU2341220102)",
        "Jeet Borse (IU231220139)",
        "Bhavya Vaidya (IU2341220099)",
        "Shiven Asopa (IU2341220142)"
    ]

    for c in candidates:
        p_sig = doc.add_paragraph()
        p_sig.paragraph_format.space_before = Pt(6)
        p_sig.paragraph_format.space_after = Pt(2)
        r = p_sig.add_run("___________________________________\nCandidate’s Signature\n" + c)
        r.font.name = "Times New Roman"
        r.font.size = Pt(11)

    p_guide = doc.add_paragraph()
    p_guide.paragraph_format.space_before = Pt(10)
    p_guide.paragraph_format.space_after = Pt(2)
    r = p_guide.add_run("___________________________________\nGuide: Ms. Sheatal Panchal\nAssistant Professor,\nDepartment of Information Technology,\nIndus Institute of Technology and Engineering\nINDUS UNIVERSITY– Ahmedabad,\nState: Gujarat")
    r.font.name = "Times New Roman"
    r.font.size = Pt(11)

    doc.add_page_break()

    # =============================================================
    # PAGE 4: CERTIFICATE
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(14)
    p.paragraph_format.space_after = Pt(4)
    r = p.add_run("INDUS INSTITUTE OF TECHNOLOGY AND ENGINEERING\nINFORMATION TECHNOLOGY\n2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(14)
    r.font.bold = True

    p_logo = doc.add_paragraph()
    p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_logo.paragraph_format.space_before = Pt(8)
    p_logo.paragraph_format.space_after = Pt(10)
    r_logo = p_logo.add_run()
    r_logo.add_picture("scratch/pdf_images/page_1_0_Image13.png", width=Inches(2.5))

    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(10)
    r = p.add_run("CERTIFICATE")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    p_dt = doc.add_paragraph()
    p_dt.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_dt.paragraph_format.space_before = Pt(4)
    p_dt.paragraph_format.space_after = Pt(10)
    r = p_dt.add_run("Date: 30/09/2026")
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    add_p("This is to certify that the project work entitled \"CyberShield-AI: AI-Powered Cyber Threat Intelligence, Detection, Analysis and Attack Prediction Platform\" has been carried out by Yash Raj (IU2341220107), Ganesh Kondekar (IU2341220102), Jeet Borse (IU231220139), Bhavya Vaidya (IU2341220099), Shiven Asopa (IU2341220142) under my guidance in partial fulfillment of degree of Bachelor of Technology in Information Technology (7th semester of Indus University, Ahmedabad during the academic year 2026 – 2027).")

    # Signatures table (2 cols)
    t_sig = doc.add_table(rows=1, cols=2)
    t_sig.alignment = WD_TABLE_ALIGNMENT.CENTER
    c1, c2 = t_sig.rows[0].cells
    c1.width = Inches(3.1)
    c2.width = Inches(3.1)
    
    p1 = c1.paragraphs[0]
    p1.paragraph_format.space_before = Pt(40)
    r1 = p1.add_run("___________________________\nMs. Sheatal Panchal\nAssistant Professor,\nDepartment of Information Technology,\nI.I.T.E. , Indus University\nAhmedabad")
    r1.font.name = "Times New Roman"
    r1.font.size = Pt(11)

    p2 = c2.paragraphs[0]
    p2.paragraph_format.space_before = Pt(40)
    r2 = p2.add_run("___________________________\nDr. Shruti B Yagnik\nHead of the Department,\nDepartment of Information Technology,\nI.I.T.E. , Indus University\nAhmedabad")
    r2.font.name = "Times New Roman"
    r2.font.size = Pt(11)

    doc.add_page_break()

    # =============================================================
    # PAGE 5: ACKNOWLEDGEMENT
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run("ACKNOWLEDGEMENT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    add_p("I would like to express my sincere gratitude to all those who have contributed to the successful completion of my Bachelor of Technology Project.")
    add_p("Firstly, I would like to thank my project guide, Ms. Sheatal Panchal, for their guidance and support throughout the project. Their valuable insights, technical suggestions, and continual encouragement have been instrumental in shaping my work and refining the AI anomaly detection algorithms, threat telemetry pipelines, and system architecture of the CyberShield-AI platform.")
    add_p("I am also deeply grateful to the faculty members of the Department of Information Technology Engineering for their support, academic environment, and encouragement. Their feedback during project milestones has been invaluable in improving the functional quality and reliability of my work.")
    add_p("I would like to express my heartfelt gratitude to my family and friends for their unwavering support, understanding, and encouragement throughout the duration of this project. Their constant motivation has been a steadfast source of inspiration for me.")
    add_p("Lastly, I would like to thank Indus University and the Institute of Technology and Engineering for providing me with the necessary laboratory resources, technical infrastructure, and facilities to complete this project successfully.")
    add_p("Thank you all for your support and guidance.")

    p_ack_names = doc.add_paragraph()
    p_ack_names.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_ack_names.paragraph_format.space_before = Pt(20)
    r = p_ack_names.add_run(
        "Yash Raj (IU2341220107)\n"
        "Ganesh Kondekar (IU2341220102)\n"
        "Jeet Borse (IU231220139)\n"
        "Bhavya Vaidya (IU2341220099)\n"
        "Shiven Asopa (IU2341220142)\n"
        "B.Tech (Information Technology)"
    )
    r.font.name = "Times New Roman"
    r.font.size = Pt(12)
    r.font.bold = True

    doc.add_page_break()

    # =============================================================
    # PAGES 6-8: TABLE OF CONTENT
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run("TABLE OF CONTENT")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    toc_data = [
        ("ABSTRACT", "1"),
        ("LIST OF FIGURES", "2"),
        ("LIST OF TABLES", "4"),
        ("ABBREVIATION", "5"),
        ("CHAPTER 1 INTRODUCTION", "7"),
        ("    1.1 Project Summary", "8"),
        ("    1.2 Project Purpose", "8"),
        ("    1.3 Project Scope", "9"),
        ("    1.4 Objectives (Main & Secondary)", "9"),
        ("    1.5 Technology And Tools", "10"),
        ("    1.6 Synopsis", "11"),
        ("CHAPTER 2 LITERATURE SURVEY", "12"),
        ("    2.1 Introduction Of Survey", "13"),
        ("    2.2 Why Survey ?", "14"),
        ("CHAPTER 3 PROJECT MANAGEMENT", "15"),
        ("    3.1 Project Planning Objectives", "16"),
        ("    3.2 Project Scheduling & Timeline", "17"),
        ("    3.3 Risk Management & Mitigation", "19"),
        ("CHAPTER 4 SYSTEM REQUIREMENTS", "21"),
        ("    4.1 User Characteristics", "22"),
        ("    4.2 Functional Requirements", "22"),
        ("    4.3 Non-Functional Requirements", "23"),
        ("    4.4 Hardware And Software Requirements", "24"),
        ("CHAPTER 5 SYSTEM ANALYSIS", "25"),
        ("    5.1 Study Of Current System", "26"),
        ("    5.2 Problems In Current System", "26"),
        ("    5.3 Requirement Of New System", "27"),
        ("    5.4 Process Model (Spiral Model)", "27"),
        ("    5.5 Feasibility Study", "29"),
        ("CHAPTER 6 DETAIL DESCRIPTION", "31"),
        ("    6.1 Core Security & SOC Analyst Operations", "32"),
        ("    6.2 Executive Reporting & Incident Intelligence", "38"),
        ("    6.3 Central Administrator Module", "40"),
        ("CHAPTER 7 TESTING", "43"),
        ("    7.1 Black-Box Testing", "44"),
        ("    7.2 White-Box Testing", "44"),
        ("    7.3 Comprehensive Test Cases", "45"),
        ("CHAPTER 8 SYSTEM DESIGN", "48"),
        ("    8.0 Multi-Tier Architecture Diagram", "49"),
        ("    8.1 Class Diagram", "50"),
        ("    8.2 Use-Case Diagram", "51"),
        ("    8.3 Activity Diagram", "52"),
        ("    8.4 Data Flow Diagrams (Level 0 & 1)", "53"),
        ("    8.5 Entity-Relationship (ER) Diagram", "55"),
        ("    8.6 Data Dictionary", "57"),
        ("CHAPTER 9 LIMITATION AND FUTURE ENHANCEMENTS", "59"),
        ("    9.1 Limitations", "60"),
        ("    9.2 Future Enhancements", "60"),
        ("CHAPTER 10 CONCLUSION", "61"),
        ("BIBLIOGRAPHY / REFERENCES", "63")
    ]

    t_toc = doc.add_table(rows=len(toc_data) + 1, cols=2)
    format_table(t_toc, [Inches(5.0), Inches(1.2)], ["Title", "Page No"], toc_data)

    doc.add_page_break()

    # =============================================================
    # PAGES 9-10: LIST OF FIGURES
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run("LIST OF FIGURES")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    figures_data = [
        ("Fig. 3.1.3.1 SDLC Process Cycle", "16"),
        ("Fig. 3.2.3.1 Time Allocation Gantt Chart", "17"),
        ("Fig. 5.4.1 Spiral Model Process Methodology", "28"),
        ("Fig. 6.1.1 CyberShield-AI Threat Intelligence Landing Page & Hero Section", "32"),
        ("Fig. 6.1.2 Multi-Role Authentication & Security Analyst Login Gateway", "33"),
        ("Fig. 6.1.3 SOC Analyst Account Registration Portal", "34"),
        ("Fig. 6.1.4 Primary SOC Operations Command Center & Executive Overview", "35"),
        ("Fig. 6.1.5 Live Security Logs Ingestion & Telemetry Data Grid", "36"),
        ("Fig. 6.1.6 Threat Intelligence Feeds & Indicator Tracking Console", "36"),
        ("Fig. 6.1.7 Real-Time Incident Alerts & Triage Management Board", "37"),
        ("Fig. 6.1.8 AI Attack Forecasting & ML Threat Prediction Engine", "38"),
        ("Fig. 6.1.9 Global Geospatial Cyber Threat Map & Telemetry", "39"),
        ("Fig. 6.2.1 Executive Compliance & Threat Intelligence Reporting Hub", "40"),
        ("Fig. 6.3.1 Central User Administration & Role-Based Access Control", "41"),
        ("Fig. 6.3.2 Enterprise Security Platform & Notification Settings", "42"),
        ("Fig. 8.0 Multi-Tier System Architecture of CyberShield-AI Platform", "49"),
        ("Fig. 8.1 Class Diagram of CyberShield-AI Architecture", "50"),
        ("Fig. 8.2 Use-Case Diagram of CyberShield-AI Platform", "51"),
        ("Fig. 8.3 Activity Diagram (End-to-End Threat Ingestion Lifecycle)", "52"),
        ("Fig. 8.4 (a) Data Flow Diagram (DFD Level 0 Context Diagram)", "53"),
        ("Fig. 8.4 (b) Data Flow Diagram (DFD Level 1 Subsystem Decomposition)", "54"),
        ("Fig. 8.5.1 ER Diagram Symbols & Conventions", "55"),
        ("Fig. 8.5.2 Entity-Relationship (ER) Diagram of CyberShield-AI", "56")
    ]

    t_figs = doc.add_table(rows=len(figures_data) + 1, cols=2)
    format_table(t_figs, [Inches(5.0), Inches(1.2)], ["Figure No. & Title", "Page No."], figures_data)

    doc.add_page_break()

    # =============================================================
    # PAGE 11: LIST OF TABLES
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(16)
    r = p.add_run("LIST OF TABLES")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    tables_data = [
        ("Table 3.2.3.2 Task Sets Breakdown & Deliverables", "18"),
        ("Table 3.3.2 Risk Projection & Mitigation Matrix", "20"),
        ("Table 4.4.1 Hardware & Software Specifications", "24"),
        ("Table 7.3.1 Comprehensive Test Cases (Black-Box & Functional)", "45"),
        ("Table 8.6.1 Data Dictionary: User Entity", "57"),
        ("Table 8.6.2 Data Dictionary: Security Log Document Store", "57"),
        ("Table 8.6.3 Data Dictionary: Incident Alert Entity", "58"),
        ("Table 8.6.4 Data Dictionary: Threat Score Entity", "58")
    ]

    t_tbls = doc.add_table(rows=len(tables_data) + 1, cols=2)
    format_table(t_tbls, [Inches(5.0), Inches(1.2)], ["Table No. & Title", "Page No."], tables_data)

    doc.add_page_break()

    # =============================================================
    # PAGES 12-13: ABBREVIATIONS
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(10)
    r = p.add_run("ABBREVIATION")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    add_p("Abbreviations used throughout this document for the CyberShield-AI Platform:")

    abbrev_data = [
        ("AI", "Artificial Intelligence"),
        ("API", "Application Programming Interface"),
        ("AUC-ROC", "Area Under the Receiver Operating Characteristic Curve"),
        ("Bcrypt", "Blowfish-based Password Hashing Function"),
        ("CORS", "Cross-Origin Resource Sharing"),
        ("CSS3", "Cascading Style Sheets 3"),
        ("CVE", "Common Vulnerabilities and Exposures"),
        ("DFD", "Data Flow Diagram"),
        ("ERD", "Entity Relationship Diagram"),
        ("FastAPI", "Modern High-Performance Python Asynchronous Web Framework"),
        ("HTTP", "Hypertext Transfer Protocol"),
        ("IDS", "Intrusion Detection System"),
        ("IPS", "Intrusion Prevention System"),
        ("JSON", "JavaScript Object Notation"),
        ("JWT", "JSON Web Token (Secure Stateless Authentication)"),
        ("KPI", "Key Performance Indicator"),
        ("ML", "Machine Learning"),
        ("Mongoose", "Object Data Modeling (ODM) Library for MongoDB"),
        ("NestJS", "Progressive Enterprise TypeScript Node.js Backend Framework"),
        ("Next.js", "React Production Framework with App Router and Turbopack"),
        ("OCSVM", "One-Class Support Vector Machine"),
        ("ORM", "Object-Relational Mapping (Prisma Client v6)"),
        ("PostgreSQL", "Enterprise Relational Database Management System"),
        ("RBAC", "Role-Based Access Control"),
        ("REST", "Representational State Transfer"),
        ("SDLC", "Software Development Life Cycle"),
        ("SHAP", "SHapley Additive exPlanations (Explainable AI Engine)"),
        ("SIEM", "Security Information and Event Management"),
        ("SOC", "Security Operations Center"),
        ("SPA", "Single Page Application"),
        ("SQL", "Structured Query Language"),
        ("UML", "Unified Modeling Language"),
        ("URI", "Uniform Resource Identifier"),
        ("XAI", "Explainable Artificial Intelligence")
    ]

    t_abbr = doc.add_table(rows=len(abbrev_data) + 1, cols=2)
    format_table(t_abbr, [Inches(1.8), Inches(4.4)], ["Abbreviation", "Full Form"], abbrev_data)

    doc.add_page_break()

    # =============================================================
    # CHAPTER 1: INTRODUCTION
    # =============================================================
    add_chapter_header(1, "INTRODUCTION", [
        "PROJECT SUMMARY",
        "PROJECT PURPOSE",
        "PROJECT SCOPE",
        "OBJECTIVES",
        "TECHNOLOGY & TOOLS",
        "SYNOPSIS"
    ])

    add_h2("1.1 PROJECT SUMMARY")
    add_p("The CyberShield-AI project develops a state-of-the-art cyber threat intelligence, detection, analysis, and attack prediction platform engineered to safeguard critical digital infrastructure against modern attack vectors. While enterprise networks process millions of network events every hour, conventional Security Information and Event Management (SIEM) systems rely heavily on brittle rule sets and static signatures. This creates massive operational friction: security analysts suffer from chronic alert fatigue, critical zero-day anomalies go unnoticed, and disparate threat feeds lack unified correlation.")
    add_p("CyberShield-AI bridges this divide by delivering an integrated, full-stack intelligence ecosystem tailored to three distinct user tiers: Security Operations Center (SOC) Analysts, Threat Intelligence Specialists, and Central System Administrators. The platform ingests heterogeneous security logs (firewall logs, intrusion detection events, authentication records, and cloud telemetry), subjects them to an unsupervised machine learning ensemble combining Isolation Forest and One-Class Support Vector Machines (OCSVM), generates explainable attribution reasons via SHAP (SHapley Additive exPlanations), forecasts impending multi-stage attack progressions mapped to MITRE ATT&CK tactics, and renders real-time geospatial telemetry on interactive tactical dashboards.")

    add_h2("1.2 PROJECT PURPOSE")
    add_p("The fundamental purpose of CyberShield-AI is to eliminate proactive threat detection delays, mitigate analyst cognitive fatigue, and enhance enterprise digital resilience:")
    add_bullet("Rapid Threat Redressal & Triage", "Eliminate multi-day forensic lags by empowering SOC analysts to inspect, prioritize, and contain high-severity incidents in under 60 seconds from an intuitive web command center.")
    add_bullet("Unsupervised AI Anomaly Detection", "Remove dependency on outdated signature databases by deploying an ensemble of Isolation Forest (200 isolation trees) and One-Class SVM with radial basis function (RBF) kernels to flag unknown zero-day anomalies.")
    add_bullet("Explainable AI (XAI) Attribution", "Demystify black-box machine learning predictions by pairing SHAP feature contribution analysis with heuristic rule justification, providing human-readable explanations for every triggered alert.")
    add_bullet("Multi-Stage Attack Forecasting", "Identify attack precursors (such as port reconnaissance and credential stuffing) before catastrophic exfiltration occurs by correlating temporal log patterns against the MITRE ATT&CK framework.")
    add_bullet("End-to-End Enterprise Accountability", "Provide verifiable immutable audit trails, role-based access restrictions, and automated compliance reporting accessible to frontline security analysts and Chief Information Security Officers (CISOs) alike.")

    add_h2("1.3 PROJECT SCOPE")
    add_p("The architectural scope of CyberShield-AI spans the complete lifecycle of cyber threat intelligence: multi-role authentication with JWT tokens, high-throughput log ingestion through NestJS 11 REST controllers, polyglot persistence utilizing MongoDB 7 for unstructured log documents and PostgreSQL 16 for structured ACID compliance, asynchronous background job queuing via Redis 7 and BullMQ, microservice machine learning inference through Python FastAPI 0.115, explainable AI model serving, real-time Recharts and Leaflet geospatial data visualization in Next.js 16, and automated incident triage workflows.")

    add_h2("1.4 OBJECTIVES")
    add_h3("1.4.1 Main Objectives")
    add_bullet("1. Responsive SOC Web Client", "Build a high-performance Next.js 16 and React 19 Single Page Application enabling analysts to explore logs, triage alerts, and inspect telemetry with sub-second page transitions.")
    add_bullet("2. Ensemble ML Detection Service", "Deploy an autonomous FastAPI intelligence service pairing Isolation Forest and One-Class SVM to score incoming event anomalies on a continuous scale from 0.0 to 100.0.")
    add_bullet("3. Explainable Threat Scoring", "Generate granular SHAP attribution vectors explaining exactly why a specific network flow, destination port, or packet count triggered an anomaly threshold.")
    add_bullet("4. Role-Based Security Governance", "Furnish dedicated permission layers for Viewers, Analysts, and Administrators with strict JWT authentication, bcrypt password hashing, and endpoint route guards.")

    add_h3("1.4.2 Secondary Objectives")
    add_bullet("1. Real-Time Geospatial Attack Mapping", "Render interactive Leaflet world maps showing global attack origins, geographic threat clusters, and real-time malicious IP vectors.")
    add_bullet("2. Attack Progression Forecasting", "Compute predictive confidence scores for multi-stage threat progression (Reconnaissance ➔ Weaponization ➔ Delivery ➔ Exploitation ➔ Exfiltration).")
    add_bullet("3. Executive Governance Analytics", "Equip security executives with automated compliance summaries, severity distribution donuts, 30-day threat trend charts, and exportable PDF audit reports.")

    add_h2("1.5 TECHNOLOGY & TOOLS")
    add_bullet("Frontend Client", "Next.js 16.2 (App Router with Turbopack), React 19.2, Tailwind CSS 4, Zustand state management, Recharts 3.8 visual analytics, Leaflet 1.9 & React-Leaflet interactive maps, Lucide React icons, Axios HTTP client.")
    add_bullet("Backend API Server", "NestJS 11 LTS, TypeScript 5, Prisma ORM v6, Passport JWT authentication, BullMQ distributed background queue, Class-Validator, Winston logging.")
    add_bullet("AI & Intelligence Microservice", "FastAPI 0.115, Uvicorn ASGI, Scikit-Learn 1.6, SHAP 0.46, NumPy 2.2, Pandas 2.2, Joblib model persistence.")
    add_bullet("Data Persistence & Queuing", "PostgreSQL 16 (Relational DB for users, alerts, threat scores, audit logs), MongoDB 7 (Document store for high-volume raw security logs), Redis 7 (In-memory message broker & job queue).")
    add_bullet("DevOps & Development", "Docker & Docker Compose containerization, Node.js v20+, Python 3.11+, Git version control, VS Code, RESTful API testing suites.")

    add_h2("1.6 SYNOPSIS")
    add_p("CyberShield-AI transforms cyber defense from reactive firefighting to predictive intelligence. By uniting high-speed streaming ingestion, unsupervised anomaly detection ensembles, explainable AI explanations, and intuitive SOC visualization, the platform delivers enterprise-grade cyber situation awareness while minimizing false positives and accelerating incident remediation.")

    doc.add_page_break()

    # =============================================================
    # CHAPTER 2: LITERATURE SURVEY
    # =============================================================
    add_chapter_header(2, "LITERATURE SURVEY", [
        "INTRODUCTION OF SURVEY",
        "WHY SURVEY ?"
    ])

    add_h2("2.1 INTRODUCTION OF SURVEY")
    add_p("To establish a rigorous technical foundation for CyberShield-AI, an extensive literature survey was conducted across existing SIEM solutions, machine learning intrusion detection architectures, explainable artificial intelligence frameworks, and multi-tier polyglot persistence models:")
    add_bullet("1. Study of Traditional SIEM Platforms", "Investigated commercial systems such as Splunk, Elastic SIEM, and Apache Metron. Findings revealed that while legacy SIEMs excel at log indexing and search, over 70% of generated alerts represent false positives due to rigid static thresholding. Furthermore, static rule maintenance requires unsustainable engineering hours, failing against novel polymorphism.")
    add_bullet("2. Machine Learning for Network Anomaly Detection", "Evaluated supervised vs. unsupervised algorithms for cyber threat classification. Research demonstrated that supervised models suffer severe degradation in production due to label scarcity and class imbalance. In contrast, unsupervised ensembles combining Isolation Forest (iForest) and One-Class Support Vector Machines (OCSVM) achieve superior detection rates on unseen zero-day exploits while maintaining sub-100ms inference times.")
    add_bullet("3. Explainable AI (XAI) in Cybersecurity Operations", "Analyzed model interpretability frameworks including LIME and SHAP. Findings highlighted that security analysts routinely distrust black-box machine learning predictions. Implementing SHAP TreeExplainer enables exact additive feature attribution, translating mathematical hyperplanes into intuitive analyst-facing indicators (e.g., 'Source Port 445 unusual for host role').")
    add_bullet("4. Attack Stage Correlation & Predictive Analytics", "Investigated cyber kill chain and MITRE ATT&CK mapping methodologies. Correlating sequential low-severity reconnaissance events across sliding time windows enables probabilistic prediction of follow-on lateral movement and exfiltration with high statistical precision.")
    add_bullet("5. Polyglot Persistence in High-Velocity Log Ingestion", "Surveyed database architectures handling tens of thousands of write events per second. Coupling MongoDB for schema-flexible raw log storage with PostgreSQL for relational referential integrity (analysts, alerts, audit trails) prevents write lockouts while preserving relational querying capabilities.")

    add_h2("2.2 WHY SURVEY ?")
    add_p("Conducting this survey was imperative to diagnose why existing enterprise security tools fail to prevent catastrophic intrusions despite high capital expenditure. By pinpointing core bottlenecks—specifically alert fatigue, zero-day blind spots, lack of interpretability, and database write congestion—CyberShield-AI was engineered from the ground up with decoupled microservices, unsupervised ML ensembles, SHAP XAI interpretability, and polyglot persistence, ensuring enterprise-grade operational reliability and instantaneous threat triage.")

    doc.add_page_break()

    # =============================================================
    # CHAPTER 3: PROJECT MANAGEMENT
    # =============================================================
    add_chapter_header(3, "PROJECT MANAGEMENT", [
        "PROJECT PLANNING OBJECTIVES",
        "PROJECT SCHEDULING",
        "RISK MANAGEMENT"
    ])

    add_h2("3.1 PROJECT PLANNING OBJECTIVES")
    add_p("Project planning established clear software tools, resource management, and engineering sustainability principles:")
    add_bullet("Modern Code & Version Control", "Standardized repository structure utilizing Git feature branches, automated linting via ESLint and Prettier, TypeScript strict mode, and Python PEP 8 compliance.")
    add_bullet("Human Resource Allocation", "Collaborative task division covering Frontend SOC UI/UX, NestJS API engineering, FastAPI Machine Learning pipelines, Quality Assurance validation, and academic documentation under the faculty guide Ms. Sheatal Panchal.")
    add_bullet("Environmental & Operational Sustainability", "Cloud-native containerized architecture minimizing server energy footprint, completely paperless audit reporting, and intelligent triage prioritization that prevents wasted analyst investigations.")
    add_bullet("Structured SDLC Process", "Adopted a structured Software Development Life Cycle adhering to six distinct iterative phases: Threat Modeling, System Analysis, System Design, Implementation, Testing & Attack Simulation, and Deployment.")

    add_figure("scratch/diagrams/fig_3_1_3_1_sdlc.png", "Fig. 3.1.3.1: Software Development Life Cycle (SDLC) Process Cycle", width=Inches(4.8))

    add_h2("3.2 PROJECT SCHEDULING")
    add_p("Development was divided into 16 academic sprint weeks across distinct functional milestones:")

    add_figure("scratch/diagrams/fig_3_2_3_1_gantt.png", "Fig. 3.2.3.1: Time Allocation Gantt Chart (Weeks 1 to 16)", width=Inches(5.8))

    add_h3("3.2.3.2 Task Sets Breakdown")
    gantt_table_data = [
        ("Pre-Project Discussion", "Topic selection, cyber threat landscape analysis, and architectural roadmap design."),
        ("Problem Investigation Phase", "Literature survey on SIEM limitations, ML anomaly algorithms, and XAI frameworks."),
        ("First Progress Report", "System requirement specification (SRS), UML design models, and dual-database schemas."),
        ("Second Progress Report", "Core NestJS backend APIs, FastAPI ML microservice, and Docker Compose orchestration."),
        ("Initial Project File Checking", "Next.js 16 SOC frontend, Recharts analytics, Leaflet attack map, and triage queues."),
        ("Internal Presentation & Viva", "End-to-end multi-role live system execution, ML zero-day failover test, and final viva."),
        ("Final Documentation", "Hardcopy academic project report submission following university standards.")
    ]
    t_gantt = doc.add_table(rows=len(gantt_table_data) + 1, cols=2)
    format_table(t_gantt, [Inches(2.2), Inches(4.0)], ["Project Criteria", "Presentation & Deliverables"], gantt_table_data)

    add_h2("3.3 RISK MANAGEMENT")
    add_p("Technical and operational uncertainties were systematically cataloged, projected, and mitigated:")

    risk_table_data = [
        ("ML Service Temporary Downtime", "Medium", "Moderate", "NestJS BullMQ worker catches HTTP timeout, queues job with exponential backoff, and marks log with fallback heuristic score."),
        ("Massive Concurrent Log Flood", "High", "High", "BullMQ distributed Redis queue buffers burst traffic; MongoDB performs non-blocking batched bulk inserts."),
        ("Model Classification Drift", "Medium", "Moderate", "Retraining pipeline tracks silhouette scores and decision thresholds; alerts trigger when feature distribution drifts."),
        ("Unauthorized Privilege Escalation", "Low", "Severe", "Strict JWT role-based access control (RBAC) and NestJS RolesGuard enforce least privilege across all API endpoints."),
        ("Black-Box Analyst Distrust", "Medium", "Moderate", "SHAP TreeExplainer generates human-readable feature contribution summaries for every critical alert.")
    ]
    t_risk = doc.add_table(rows=len(risk_table_data) + 1, cols=4)
    format_table(t_risk, [Inches(1.8), Inches(1.1), Inches(1.1), Inches(2.2)], ["Risk Identified", "Probability", "Impact Effect", "Mitigation Strategy"], risk_table_data)

    doc.add_page_break()

    # =============================================================
    # CHAPTER 4: SYSTEM REQUIREMENTS
    # =============================================================
    add_chapter_header(4, "SYSTEM REQUIREMENTS", [
        "USER CHARACTERISTICS",
        "FUNCTIONAL REQUIREMENT",
        "NON FUNCTIONAL REQUIREMENT",
        "HARDWARE AND SOFTWARE REQUIREMENT"
    ])

    add_h2("4.1 USER CHARACTERISTICS")
    add_bullet("1. Security Analyst (Frontline SOC)", "Cybersecurity personnel responsible for reviewing live threat streams, inspecting suspicious security logs, investigating alerts, and executing IP containment actions.")
    add_bullet("2. Threat Intelligence Lead / Auditor", "Senior intelligence specialists examining attack forecasting trends, analyzing MITRE ATT&CK tactic progressions, reviewing threat origin geography, and compiling audit reports.")
    add_bullet("3. System Administrator", "Enterprise IT administrators overseeing user accounts, configuring role assignments (Viewer, Analyst, Admin), managing database connections, and triggering ML model retraining.")

    add_h2("4.2 FUNCTIONAL REQUIREMENT")
    add_bullet("1. Enterprise Multi-Role Authentication & Session Security", "JWT stateless token pair architecture (15-minute access token and 7-day rotating refresh token), bcrypt salted password hashing with 12 computational cost rounds, granular RBAC (Viewer, Analyst, Administrator), automatic token rotation, and route protection guards.")
    add_bullet("2. High-Throughput Security Log Ingestion & Telemetry Pipeline", "Ingests single and batch event streams from heterogeneous sensors (Windows Event Logs, firewalls, IDS/IPS, cloud audit trails). Ingestion handles 10,000+ local development benchmark logs and scales past 1,200,000+ distributed enterprise events via asynchronous Redis queuing and MongoDB document stores.")
    add_bullet("3. Unsupervised Ensemble Machine Learning Threat Engine", "High-performance Python FastAPI service pairing Isolation Forest (200 isolation trees) and One-Class Support Vector Machine (RBF kernel) to detect novel zero-day anomalies on unseen network data without requiring historic attack labels.")
    add_bullet("4. Explainable AI (XAI) Feature Attribution via SHAP", "Interprets anomaly decisions using SHAP (SHapley Additive exPlanations) TreeExplainer, generating ranked human-readable positive and negative contribution factors to eliminate 'black-box' distrust among frontline analysts.")
    add_bullet("5. Incident Alert Triage & Containment Lifecycle", "Automated alert creation for events reaching or exceeding composite threat score thresholds (>= 60), offering full state machine workflow (NEW -> INVESTIGATING -> RESOLVED -> FALSE_POSITIVE) with single-click IP blocking and containment actions.")
    add_bullet("6. Predictive Multi-Stage Attack Forecasting", "Sequential pattern recognition correlating early reconnaissance probes with MITRE ATT&CK tactics (Credential Access, Lateral Movement, Exfiltration) to calculate probabilistic foresight percentages.")
    add_bullet("7. Real-Time Global Geospatial Cyber Threat Map", "Interactive dark-mode Leaflet/CartoDB world map plotting global source IP attack origins, cluster intensities, threat trajectories, and country risk heatmaps with zero third-party API key blockers.")
    add_bullet("8. Executive Governance & Automated Compliance Reporting", "Pre-built compliance audit generators for ISO 27001, SOC 2, and NIST CSF, severity distribution donuts, 30-day incident trend timelines, and tamper-evident administrative audit logs.")

    add_h2("4.3 NON-FUNCTIONAL REQUIREMENT")
    add_bullet("Performance & Latency", "API ingestion response < 20ms; ML inference latency < 100ms per batch; frontend initial dashboard render < 1.0s.")
    add_bullet("Reliability & Graceful Degradation", "99.9% uptime. If the Python ML microservice becomes unavailable, log ingestion continues uninterrupted while jobs wait in Redis queue.")
    add_bullet("Security & Data Protection", "Bcrypt password hashing, short-lived JWT access tokens (15m) paired with rotating refresh tokens (7d), CORS whitelisting, and SQL injection prevention via Prisma ORM.")
    add_bullet("Usability & Accessibility", "Dark-mode Security Operations Center interface built with high-contrast WCAG 2.1 compliant tokens and responsive desktop/tablet layouts.")

    add_h2("4.4 HARDWARE AND SOFTWARE REQUIREMENT")
    hw_sw_data = [
        ("Hardware", "Processor", "Intel Core i5 / AMD Ryzen 5 or higher (Quad-Core minimum)"),
        ("Hardware", "Memory (RAM)", "8 GB RAM minimum (16 GB recommended for full Docker stack)"),
        ("Hardware", "Storage", "256 GB SSD with at least 15 GB free space for database volumes"),
        ("Software", "Operating System", "Windows 10/11 (64-bit), Linux (Ubuntu 22.04 LTS), macOS"),
        ("Software", "Frontend Runtime", "Node.js v20+, Next.js 16.2, React 19.2, Tailwind CSS 4"),
        ("Software", "Backend Framework", "NestJS 11 LTS, TypeScript 5.7, Prisma ORM v6"),
        ("Software", "AI Microservice", "Python 3.11+, FastAPI 0.115, Scikit-Learn 1.6, SHAP 0.46"),
        ("Software", "Databases & Queue", "PostgreSQL 16, MongoDB 7, Redis 7, BullMQ"),
        ("Software", "Web Browser", "Google Chrome, Microsoft Edge, Mozilla Firefox (Modern Evergreen)")
    ]
    t_hw_sw = doc.add_table(rows=len(hw_sw_data) + 1, cols=3)
    format_table(t_hw_sw, [Inches(1.8), Inches(1.8), Inches(2.6)], ["Resource Category", "Component", "Recommended Specification"], hw_sw_data)

    doc.add_page_break()

    # =============================================================
    # CHAPTER 5: SYSTEM ANALYSIS
    # =============================================================
    add_chapter_header(5, "SYSTEM ANALYSIS", [
        "STUDY OF CURRENT SYSTEM",
        "PROBLEMS IN CURRENT SYSTEM",
        "REQUIREMENT OF NEW SYSTEM",
        "PROCESS MODEL",
        "FEASIBILITY STUDY"
    ])

    add_h2("5.1 STUDY OF CURRENT SYSTEM")
    add_p("In prevailing enterprise security architectures, threat detection relies on traditional SIEM deployments (e.g., standard syslog aggregators, legacy relational databases, and static signature rules). When security events occur, rule engines perform literal string matches or threshold counts (e.g., 'flag if failed logins > 5 in 60s'). Analysts must manually review sprawling flat tables, pivot between disjointed portals to inspect firewall and server logs, and manually construct threat timelines without predictive context.")

    add_h2("5.2 PROBLEMS IN CURRENT SYSTEM")
    add_bullet("Overwhelming Alert Fatigue", "Security teams are inundated with thousands of false alerts daily due to rigid thresholding that cannot distinguish benign surges from true attacks.")
    add_bullet("Zero-Day Invisibility", "Signature-based detection is blind to novel zero-day attacks, polymorphic malware, and stealthy low-and-slow reconnaissance that evade static signatures.")
    add_bullet("Black-Box Machine Learning Gap", "Existing AI add-ons provide opaque risk scores without explaining the contributing features, leaving analysts unable to verify or act on recommendations.")
    add_bullet("Disjointed Threat Context", "Raw logs, alert tickets, geolocation metadata, and user accounts reside in isolated data silos, prolonging mean-time-to-resolution (MTTR) to days.")

    add_h2("5.3 REQUIREMENT OF NEW SYSTEM")
    add_p("The proposed CyberShield-AI platform replaces manual friction with an autonomous, unified cloud architecture: instantaneous log ingestion via Redis queues, unsupervised ensemble ML anomaly scoring, SHAP-powered explainable attribution, multi-stage attack forecasting mapped to MITRE ATT&CK, interactive geospatial attack mapping, and centralized SOC triage dashboards.")

    add_h2("5.4 PROCESS MODEL")
    add_p("The project adopted the Spiral Model due to its risk-driven, iterative nature. High-risk elements—such as unsupervised model convergence, SHAP calculation latency on high-throughput streams, dual-database synchronicity between MongoDB and PostgreSQL, and microservice container orchestration—were prototyped, tested, and refined across successive development spirals:")

    add_figure("scratch/diagrams/fig_5_4_1_spiral.png", "Fig. 5.4.1: Spiral Model Process Methodology", width=Inches(4.8))

    add_h2("5.5 FEASIBILITY STUDY")
    add_bullet("Technical Feasibility", "Built entirely on proven, enterprise-grade open-source technologies (Next.js 16, NestJS 11, FastAPI, Scikit-Learn, PostgreSQL, MongoDB, Redis) supported by extensive documentation and active global communities.")
    add_bullet("Operational Feasibility", "Intuitive, dark-mode SOC interface requiring minimal analyst onboarding. Frontline operators can triage alerts, inspect SHAP reasons, and block IPs with single-click simplicity.")
    add_bullet("Economic Feasibility", "Engineered completely with open-source frameworks and libraries, eliminating expensive per-gigabyte SIEM licensing fees and enterprise tool subscriptions.")
    add_bullet("Schedule Feasibility", "All 16 sprint deliverables were achieved strictly within the university academic calendar timeline through rigorous phase-gated execution.")

    doc.add_page_break()

    # =============================================================
    # CHAPTER 6: DETAIL DESCRIPTION
    # =============================================================
    add_chapter_header(6, "DETAIL DESCRIPTION", [
        "CORE SECURITY & SOC ANALYST OPERATIONS",
        "EXECUTIVE REPORTING & INCIDENT INTELLIGENCE",
        "CENTRAL ADMINISTRATOR MODULE"
    ])

    add_h2("6.1 CORE SECURITY & SOC ANALYST OPERATIONS")
    add_p("The Core Security & SOC Analyst Operations module empowers frontline analysts and threat hunters to monitor system health, inspect incoming log streams, analyze ML anomaly predictions, triage incident alerts, and visualize global attack telemetry in real time.")

    add_figure("scratch/screen_landing.png", "Fig. 6.1.1: CyberShield-AI Threat Intelligence Landing Page & Hero Section", width=Inches(5.6))
    add_p("Fig. 6.1.1 illustrates the CyberShield-AI landing page featuring platform value propositions, active intelligence metrics, core capability cards, and direct links to the security authentication gateway.")

    add_figure("scratch/screen_login.png", "Fig. 6.1.2: Multi-Role Authentication & Security Analyst Login Gateway", width=Inches(5.6))
    add_p("Fig. 6.1.2 depicts the secure login gateway providing JWT authentication, bcrypt password validation, credential error feedback, and least-privilege role redirection for Viewers, Analysts, and Administrators.")

    add_figure("scratch/screen_register.png", "Fig. 6.1.3: SOC Analyst Account Registration Portal", width=Inches(5.6))
    add_p("Fig. 6.1.3 shows the analyst account creation portal capturing first name, last name, enterprise email address, and secure password, establishing a new user in PostgreSQL with default Viewer permissions.")

    add_figure("scratch/screen_overview.png", "Fig. 6.1.4: Primary SOC Operations Command Center & Executive Overview", width=Inches(5.6))
    add_p("Fig. 6.1.4 demonstrates the primary SOC Command Center featuring real-time KPI counter cards, 30-day threat trend charts, severity distribution donuts, attack frequency graphs, and live threat activity streams. During initial local development execution, the telemetry pipeline monitors 10,000 live ingested security records, while the platform's distributed background architecture is engineered and benchmarked to continuously ingest and aggregate over 1.2M+ security telemetry events across enterprise sensor networks.")

    add_figure("scratch/screen_logs.png", "Fig. 6.1.5: Live Security Logs Ingestion & Telemetry Data Grid", width=Inches(5.6))
    add_p("Fig. 6.1.5 illustrates the security log exploration interface allowing analysts to search, filter by source (Firewall, IDS, Windows Security, Cloud), inspect source/destination IPs, examine severity badges, and review JSON log payloads across active log collections (scaling from 10K local logs up to 1.2M enterprise archives).")

    add_figure("scratch/screen_threats.png", "Fig. 6.1.6: Threat Intelligence Feeds & Indicator Tracking Console", width=Inches(5.6))
    add_p("Fig. 6.1.6 displays the threat intelligence feed console aggregating active threat entities (IPs, users, domains), composite threat scores, risk categories (Safe, Low, Medium, High, Critical), and associated indicators of compromise (IoCs).")

    add_figure("scratch/screen_alerts.png", "Fig. 6.1.7: Real-Time Incident Alerts & Triage Management Board", width=Inches(5.6))
    add_p("Fig. 6.1.7 depicts the incident alerts triage board equipped with severity filtering (Critical, High, Medium, Low), status toggles (New, Investigating, Resolved), SHAP explanation cards, and analyst resolution buttons.")

    add_figure("scratch/screen_predictions.png", "Fig. 6.1.8: AI Attack Forecasting & ML Threat Prediction Engine", width=Inches(5.6))
    add_p("Fig. 6.1.8 showcases the predictive intelligence console displaying multi-stage attack forecasts, MITRE ATT&CK tactic mappings (Reconnaissance, Credential Access, Lateral Movement), confidence probabilities, and proactive defensive recommendations.")

    add_figure("scratch/screen_geomap.png", "Fig. 6.1.9: Global Geospatial Cyber Threat Map & Telemetry", width=Inches(5.6))
    add_p("Fig. 6.1.9 illustrates the real-time geospatial cyber attack map rendering live origin country threat feeds, malicious IP coordinates, and visual attack vectors terminating at the SOC Command Center. The Leaflet mapping engine utilizes high-contrast CartoDB Dark basemap tiles to eliminate third-party API blocking and ensure reliable, dark-mode visualization for frontline security analysts.")

    add_h2("6.2 EXECUTIVE REPORTING & INCIDENT INTELLIGENCE")
    add_p("The Executive Reporting module provides compliance officers, SOC leads, and CISOs with automated high-level summaries, compliance posture assessments, and exportable audit documents.")

    add_figure("scratch/screen_reports.png", "Fig. 6.2.1: Executive Compliance & Threat Intelligence Reporting Hub", width=Inches(5.6))
    add_p("Fig. 6.2.1 showcases the reporting command center allowing security leads to generate compliance audits (ISO 27001, SOC 2, NIST CSF), inspect incident trend reports, and export executive threat intelligence summaries.")

    add_h2("6.3 CENTRAL ADMINISTRATOR MODULE")
    add_p("The Central Administrator module empowers enterprise IT directors to manage analyst user accounts, configure role permissions, monitor system infrastructure telemetry, and manage platform parameters.")

    add_figure("scratch/screen_users.png", "Fig. 6.3.1: Central User Administration & Role-Based Access Control", width=Inches(5.6))
    add_p("Fig. 6.3.1 illustrates the user administration console equipped with user search, role assignment controls (Viewer, Analyst, Administrator), account activation toggles, and user creation dialogs.")

    add_figure("scratch/screen_settings.png", "Fig. 6.3.2: Enterprise Security Platform & Notification Settings", width=Inches(5.6))
    add_p("Fig. 6.3.2 depicts the master platform settings interface featuring security policy configurations, alert threshold tuning, API key management, notification dispatch channels, and database connection monitors.")

    doc.add_page_break()

    # =============================================================
    # CHAPTER 7: TESTING
    # =============================================================
    add_chapter_header(7, "TESTING", [
        "BLACK-BOX TESTING",
        "WHITE-BOX TESTING",
        "COMPREHENSIVE TEST CASES"
    ])

    add_h2("7.1 BLACK-BOX TESTING")
    add_p("Black-box testing validated CyberShield-AI against functional specifications and user requirements without inspecting internal source code. Test methodologies included Equivalence Partitioning (valid/invalid IPv4 and IPv6 addresses, valid/invalid JWT tokens, port numbers 1–65535) and Boundary Value Analysis (threat scores exactly at threshold boundaries 59.9 vs. 60.0 to verify alert triggering, extreme log payload sizes, and high-frequency request bursts).")

    add_h2("7.2 WHITE-BOX TESTING")
    add_p("White-box testing inspected internal execution logic, branch coverage, and database transaction integrity across the codebase. Test suites verified JWT expiration handlers in NestJS JwtAuthGuard, RBAC decorator execution in RolesGuard, asynchronous BullMQ job state transitions in JobsProcessor, isolation forest decision tree depth in Python, SHAP additive value sum equality, and Prisma relational cascade deletions.")

    add_h2("7.3 COMPREHENSIVE TEST CASES")
    add_p("Table 7.3.1 catalogs the extensive functional, security, and machine learning test cases executed across the platform:")

    test_cases_data = [
        ("TC-01a", "User registration with valid name, email, & password.", "Account created in PostgreSQL; password hashed with bcrypt 12-round; returns 201 Created.", "Pass"),
        ("TC-01b", "Registration attempt with duplicate email address.", "Registration rejected; returns 409 Conflict 'Email already exists'; no duplicate row created.", "Pass"),
        ("TC-02a", "User login with valid analyst credentials.", "JWT access (15m) & refresh (7d) tokens generated; user redirected to SOC dashboard.", "Pass"),
        ("TC-02b", "User login with incorrect password.", "Authentication rejected; returns 401 Unauthorized 'Invalid credentials'; zero tokens issued.", "Pass"),
        ("TC-03a", "Ingest valid single security log via POST /api/logs.", "Payload validated; saved in MongoDB with isProcessed=false; job added to Redis; returns 201.", "Pass"),
        ("TC-03b", "Ingest log with malformed IP or missing port.", "ValidationPipe rejects request; returns 400 Bad Request with field-level error messages.", "Pass"),
        ("TC-04a", "ML engine analyzes benign web traffic log.", "Isolation Forest & OCSVM compute anomaly score < 0.2; Threat Score < 40; no alert generated.", "Pass"),
        ("TC-04b", "ML engine analyzes port scan / brute force event.", "Ensemble flags anomaly (score > 0.85); Threat Score >= 60; SHAP reasons generated; Alert created.", "Pass"),
        ("TC-04c", "FastAPI ML service is temporarily offline.", "BullMQ worker catches error, retries with exponential backoff; ingestion continues without crash.", "Pass"),
        ("TC-05a", "Analyst updates alert status to 'INVESTIGATING'.", "PostgreSQL alert status updated; audit log recorded; reflected immediately on SOC triage board.", "Pass"),
        ("TC-05b", "Viewer role attempts to resolve an alert via API.", "RolesGuard blocks request; returns 403 Forbidden 'Insufficient role permissions'.", "Pass"),
        ("TC-06a", "Analyst blocks confirmed malicious IP address.", "IP saved to blocked_ips table; audit record logged; subsequent traffic flagged as blocked.", "Pass"),
        ("TC-07a", "Predictive engine analyzes sequential reconnaissance.", "Calculates > 80% confidence for impending exploitation; renders MITRE ATT&CK card.", "Pass"),
        ("TC-08a", "Admin views master SOC analytics & KPI counters.", "Real-time counts for Total Logs, Alerts, Critical Incidents, and Blocked IPs displayed accurately.", "Pass"),
        ("TC-09a", "Export executive compliance audit report.", "Generates formatted PDF compliance summary with incident trends and mitigation timelines.", "Pass")
    ]
    t_test = doc.add_table(rows=len(test_cases_data) + 1, cols=4)
    format_table(t_test, [Inches(0.9), Inches(2.2), Inches(2.6), Inches(0.5)], ["Test Case ID", "Test Scenario", "Expected Result", "Status"], test_cases_data)

    doc.add_page_break()

    # =============================================================
    # CHAPTER 8: SYSTEM DESIGN
    # =============================================================
    add_chapter_header(8, "SYSTEM DESIGN", [
        "ARCHITECTURE DIAGRAM",
        "CLASS DIAGRAM",
        "USE-CASE DIAGRAM",
        "ACTIVITY DIAGRAM",
        "DATA FLOW DIAGRAMS",
        "ER DIAGRAM & DATA DICTIONARY"
    ])

    add_h2("8.0 MULTI-TIER SYSTEM ARCHITECTURE")
    add_p("CyberShield-AI employs a decoupled, cloud-native multi-tier architecture separating the Presentation Layer (Next.js 16 + React 19 + Recharts + Leaflet), Application Services Layer (NestJS 11 REST API Server, BullMQ Queue Worker, and FastAPI ML Intelligence Microservice), and Data Persistence Layer (PostgreSQL 16, MongoDB 7, Redis 7, and Serialized Joblib Model Storage):")

    add_figure("scratch/diagrams/fig_8_0_architecture.png", "Fig. 8.0: Multi-Tier System Architecture of CyberShield-AI Platform", width=Inches(5.8))

    add_h2("8.1 CLASS DIAGRAM")
    add_p("The Class Diagram models structural system entities, data attributes, member operations, and relationships across users, security logs, incident alerts, threat scores, ML models, and containment records:")

    add_figure("scratch/diagrams/fig_8_1_class_diagram.png", "Fig. 8.1: Class Diagram of CyberShield-AI Architecture", width=Inches(5.8))

    add_h2("8.2 USE-CASE DIAGRAM")
    add_p("The Use-Case Diagram depicts the interactions between primary actors (Security Analyst, System Administrator, and External Network Sensors) and system boundary features:")

    add_figure("scratch/diagrams/fig_8_2_use_case.png", "Fig. 8.2: Use-Case Diagram of CyberShield-AI Platform", width=Inches(5.8))

    add_h2("8.3 ACTIVITY DIAGRAM")
    add_p("The Activity Diagram models the end-to-end workflow from log ingestion to Redis queuing, FastAPI ML anomaly scoring, SHAP reason generation, PostgreSQL alert creation, analyst triage, and IP containment:")

    add_figure("scratch/diagrams/fig_8_3_activity.png", "Fig. 8.3: Activity Diagram (End-to-End Cyber Threat Ingestion Lifecycle)", width=Inches(5.8))

    add_h2("8.4 DATA FLOW DIAGRAM (DFD)")
    add_p("The Level 0 Context Diagram depicts data exchanges between external entities (Security Analyst, System Administrator, Network Log Sources) and the central CyberShield-AI system boundary:")

    add_figure("scratch/diagrams/fig_8_4_a_dfd0.png", "Fig. 8.4 (a): Data Flow Diagram (DFD Level 0 Context Diagram)", width=Inches(5.8))

    add_p("The Level 1 Data Flow Diagram decomposes the system into its five primary functional subsystems (Authentication, Ingestion, ML Threat Engine, Alert Triage, SOC Aggregator) and maps connections to four persistent data stores:")

    add_figure("scratch/diagrams/fig_8_4_b_dfd1.png", "Fig. 8.4 (b): Data Flow Diagram (DFD Level 1 Subsystem Decomposition)", width=Inches(5.8))

    add_h2("8.5 ENTITY-RELATIONSHIP (ER) DIAGRAM")
    add_p("Fig. 8.5.1 specifies standard Chen notation symbols, while Fig. 8.5.2 models the complete entity-relationship schema connecting users, security logs, incident alerts, threat scores, and containment records:")

    add_figure("scratch/diagrams/fig_8_5_1_er_symbols.png", "Fig. 8.5.1: ER Diagram Symbols & Conventions", width=Inches(4.8))
    add_figure("scratch/diagrams/fig_8_5_2_er_diagram.png", "Fig. 8.5.2: Entity-Relationship (ER) Diagram of CyberShield-AI", width=Inches(5.8))

    add_h2("8.6 DATA DICTIONARY")
    add_h3("Table 8.6.1: Data Dictionary - User Entity (PostgreSQL)")
    dict_user_data = [
        ("id", "UUID", "Primary Key, Auto-gen", "Unique system identifier for analyst/admin account."),
        ("email", "VarChar(255)", "Unique, Not Null", "Corporate email address used for login authentication."),
        ("password", "VarChar(255)", "Not Null", "Bcrypt 12-round salted password hash."),
        ("firstName", "VarChar(100)", "Not Null", "First name of registered user."),
        ("lastName", "VarChar(100)", "Not Null", "Last name of registered user."),
        ("role", "Enum", "VIEWER, ANALYST, ADMIN", "Role-based access permission level (Default: VIEWER)."),
        ("isActive", "Boolean", "Default True", "Account status flag indicating if login is permitted."),
        ("createdAt", "DateTime", "Default Now", "Timestamp of account registration."),
        ("updatedAt", "DateTime", "Auto Update", "Timestamp of last profile update.")
    ]
    t_du = doc.add_table(rows=len(dict_user_data) + 1, cols=4)
    format_table(t_du, [Inches(1.2), Inches(1.2), Inches(1.6), Inches(2.2)], ["Field Name", "Data Type", "Constraints", "Description"], dict_user_data)

    add_h3("Table 8.6.2: Data Dictionary - Security Log Document (MongoDB)")
    dict_log_data = [
        ("_id", "ObjectId", "Primary Key, Auto-gen", "Unique BSON document identifier in MongoDB."),
        ("timestamp", "DateTime", "Not Null, Indexed", "UTC timestamp when network event was generated."),
        ("sourceIp", "String", "Not Null, Indexed", "Origin IPv4/IPv6 address of the network connection."),
        ("destinationIp", "String", "Not Null", "Target host IPv4/IPv6 address within the network."),
        ("sourcePort", "Integer", "Range 0 to 65535", "Origin transport-layer port number."),
        ("destinationPort", "Integer", "Range 0 to 65535", "Target service port number (e.g. 22, 80, 443)."),
        ("protocol", "Enum", "TCP, UDP, ICMP, DNS...", "Network transport protocol employed."),
        ("action", "Enum", "ALLOW, DENY, DROP, ALERT", "Action taken by boundary security device."),
        ("severity", "Enum", "LOW, MEDIUM, HIGH, CRITICAL", "Severity classification of the raw log record."),
        ("isProcessed", "Boolean", "Default False, Indexed", "Flag indicating whether ML threat scoring has executed.")
    ]
    t_dl = doc.add_table(rows=len(dict_log_data) + 1, cols=4)
    format_table(t_dl, [Inches(1.2), Inches(1.2), Inches(1.6), Inches(2.2)], ["Field Name", "Data Type", "Constraints", "Description"], dict_log_data)

    add_h3("Table 8.6.3: Data Dictionary - Incident Alert Entity (PostgreSQL)")
    dict_alert_data = [
        ("id", "UUID", "Primary Key, Auto-gen", "Unique incident ticket identifier in PostgreSQL."),
        ("type", "Enum", "BRUTE_FORCE, DDOS, MALWARE...", "Categorized security incident type."),
        ("severity", "Enum", "LOW, MEDIUM, HIGH, CRITICAL", "Incident urgency level determined by ThreatScore."),
        ("status", "Enum", "NEW, INVESTIGATING, RESOLVED...", "Current lifecycle state of the incident ticket."),
        ("title", "VarChar(255)", "Not Null", "Concise summary title of the security incident."),
        ("sourceIp", "VarChar(45)", "Not Null, Indexed", "Malicious or anomalous origin IP address."),
        ("threatScore", "Float", "Range 0.0 to 100.0", "Composite risk score computed by ML ensemble."),
        ("reasons", "JsonB", "Not Null", "Array of SHAP feature attribution strings."),
        ("assignedToId", "UUID", "Foreign Key -> User.id", "Reference to assigned investigating SOC analyst."),
        ("createdAt", "DateTime", "Default Now, Indexed", "Timestamp when incident alert was triggered.")
    ]
    t_da = doc.add_table(rows=len(dict_alert_data) + 1, cols=4)
    format_table(t_da, [Inches(1.2), Inches(1.2), Inches(1.6), Inches(2.2)], ["Field Name", "Data Type", "Constraints", "Description"], dict_alert_data)

    add_h3("Table 8.6.4: Data Dictionary - Threat Score Entity (PostgreSQL)")
    dict_score_data = [
        ("id", "UUID", "Primary Key, Auto-gen", "Unique risk score entity reference number."),
        ("entityType", "Enum", "IP, USER, SESSION", "Type of entity evaluated for security risk."),
        ("entityValue", "VarChar(255)", "Not Null, Indexed", "Identifier value of the entity (e.g. IP address or username)."),
        ("score", "Float", "Range 0.0 to 100.0", "Composite normalized threat risk calculation."),
        ("category", "Enum", "SAFE, LOW, MEDIUM, HIGH, CRITICAL", "Operational risk tier assigned to the entity."),
        ("factors", "JsonB", "Not Null", "Breakdown of individual anomaly and heuristic weights."),
        ("confidence", "Float", "Range 0.0 to 1.0", "Statistical confidence probability of the ML model."),
        ("createdAt", "DateTime", "Default Now, Indexed", "Timestamp when threat score was recorded.")
    ]
    t_ds = doc.add_table(rows=len(dict_score_data) + 1, cols=4)
    format_table(t_ds, [Inches(1.2), Inches(1.2), Inches(1.6), Inches(2.2)], ["Field Name", "Data Type", "Constraints", "Description"], dict_score_data)

    doc.add_page_break()

    # =============================================================
    # CHAPTER 9: LIMITATIONS AND FUTURE ENHANCEMENTS
    # =============================================================
    add_chapter_header(9, "LIMITATION AND FUTURE ENHANCEMENTS", [
        "LIMITATIONS",
        "FUTURE ENHANCEMENTS"
    ])

    add_h2("9.1 LIMITATIONS")
    add_bullet("1. Unlabeled Zero-Day Validation", "Because zero-day threats by definition lack historical ground truth, initial anomaly confidence scoring relies on unsupervised decision margins rather than labeled verification.")
    add_bullet("2. Network Ingestion Bandwidth", "Extreme peak bursts exceeding 50,000 logs/second require multi-node Redis clustering to avoid job queue memory saturation on resource-constrained hosts.")
    add_bullet("3. Encrypted Payload Inspection", "Deep payload analysis is restricted when network traffic utilizes end-to-end TLS 1.3 encryption, shifting detection weight to flow telemetry and port metadata.")

    add_h2("9.2 FUTURE ENHANCEMENTS")
    add_bullet("1. Automated SOAR Playbook Execution", "Integrate automated Security Orchestration, Automation, and Response (SOAR) playbooks to dynamically reconfigure firewall ACLs and isolate infected endpoints.")
    add_bullet("2. Large Language Model (LLM) Incident Summarization", "Deploy local privacy-preserving LLMs (e.g., Llama 3) to generate natural language executive briefing summaries from multi-source incident logs.")
    add_bullet("3. Graph Neural Network (GNN) Attack Graphing", "Incorporate Graph Neural Networks to model lateral movement across enterprise Active Directory topologies and cloud identity graphs.")
    add_bullet("4. Decentralized Threat Intelligence Sharing", "Implement STIX/TAXII 2.1 protocol standards for federated, privacy-preserving threat intelligence exchange across partner organizations.")

    doc.add_page_break()

    # =============================================================
    # CHAPTER 10: CONCLUSION
    # =============================================================
    add_chapter_header(10, "CONCLUSION", [
        "CONCLUSION"
    ])

    add_h2("10.1 CONCLUSION")
    add_p("The CyberShield-AI Cyber Threat Intelligence, Detection, Analysis and Attack Prediction Platform demonstrates how modern cloud-native engineering, polyglot persistence, unsupervised machine learning ensembles, and explainable artificial intelligence can transform enterprise cybersecurity. Throughout the project lifecycle, the following milestones were achieved:")
    add_bullet("1. End-to-End Intelligence Ecosystem", "Successfully designed and deployed a responsive Next.js 16 and NestJS 11 platform connecting frontline SOC analysts, threat hunters, and administrators.")
    add_bullet("2. Unsupervised ML Anomaly Detection", "Engineered a high-performance Python FastAPI microservice combining Isolation Forest and One-Class SVM to detect novel cyber anomalies with sub-100ms latency.")
    add_bullet("3. Explainable AI Attribution", "Demystified machine learning predictions by pairing SHAP feature importance attributions with heuristic reasoning, eliminating black-box distrust.")
    add_bullet("4. Predictive Kill-Chain Forecasting", "Delivered multi-stage attack forecasting mapped to MITRE ATT&CK tactics, allowing proactive containment before damage occurs.")
    add_bullet("5. Rigorous Systematic Validation", "Validated all functional, security, and machine learning modules through extensive black-box, white-box, and attack simulation test suites.")
    add_p("In conclusion, CyberShield-AI bridges the critical gap between overwhelming raw security data and actionable defensive intelligence, establishing a robust, scalable, and explainable foundation for next-generation cyber defense operations.")

    doc.add_page_break()

    # =============================================================
    # BIBLIOGRAPHY / REFERENCES
    # =============================================================
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(16)
    p.paragraph_format.space_after = Pt(10)
    r = p.add_run("BIBLIOGRAPHY")
    r.font.name = "Times New Roman"
    r.font.size = Pt(18)
    r.font.bold = True

    add_h2("REFERENCES")
    add_p("List of Web References & Technical Documentation:")

    refs = [
        ("[1] Next.js Official Documentation & App Router Architecture: https://nextjs.org/docs/ [ Accessed September 2026]"),
        ("[2] NestJS Progressive TypeScript Framework Documentation: https://docs.nestjs.com/ [ Accessed September 2026]"),
        ("[3] FastAPI High-Performance Python Web Framework: https://fastapi.tiangolo.com/ [ Accessed September 2026]"),
        ("[4] Scikit-Learn Machine Learning in Python (Isolation Forest & One-Class SVM): https://scikit-learn.org/stable/ [ Accessed September 2026]"),
        ("[5] SHAP (SHapley Additive exPlanations) Interpretability Documentation: https://shap.readthedocs.io/ [ Accessed September 2026]"),
        ("[6] Prisma ORM Documentation & PostgreSQL Client: https://www.prisma.io/docs/ [ Accessed September 2026]"),
        ("[7] MongoDB Manual & Mongoose ODM: https://www.mongodb.com/docs/ [ Accessed September 2026]"),
        ("[8] BullMQ Distributed Message Queue & Redis Integration: https://docs.bullmq.io/ [ Accessed September 2026]"),
        ("[9] Leaflet Open-Source Interactive Maps Library: https://leafletjs.com/ [ Accessed September 2026]"),
        ("[10] MITRE ATT&CK Enterprise Matrix & Adversary Tactics: https://attack.mitre.org/ [ Accessed September 2026]"),
        ("[11] Recharts Composable Charting Library for React: https://recharts.org/ [ Accessed September 2026]")
    ]

    for ref in refs:
        p_ref = doc.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.space_before = Pt(2)
        p_ref.paragraph_format.space_after = Pt(6)
        p_ref.paragraph_format.line_spacing = 1.15
        r_ref = p_ref.add_run(ref)
        r_ref.font.name = "Times New Roman"
        r_ref.font.size = Pt(11)

    # Save document
    doc.save(DOC_NAME)
    print(f"Document saved successfully as '{DOC_NAME}'!")

if __name__ == "__main__":
    create_report()
