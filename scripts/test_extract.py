import fitz

doc = fitz.open(r"C:\files-2.pdf")
page = doc[0]
text = page.get_text("text")
print(text)
