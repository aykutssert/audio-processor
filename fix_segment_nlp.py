import json
import spacy

# Spacy modelini yükle
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Model bulunamadı: python -m spacy download en_core_web_sm")
    exit()

def nlp_precise_align(data):
    full_text = ""
    # Char-to-Time Map: Her karakterin (index) tam olarak hangi saniyeye denk geldiğini tutar.
    char_time_map = [] 

    for item in data:
        text = item['text']
        start = item['start']
        end = item['end']
        duration = end - start
        
        # Temizlik: Fazla boşlukları at ama orijinal uzunluğu koru
        clean_text = text.strip()
        if not clean_text:
            continue
            
        seg_len = len(clean_text)
        time_per_char = duration / seg_len

        # 1. HATA ÇÖZÜMÜ: Boşluk Kontrolü
        # Eğer full_text doluysa ve sonu boşlukla bitmiyorsa, araya boşluk ekle
        # Ancak time_map'e bu yapay boşluk için de bir süre (önceki segmentin bitişi) atamalıyız.
        if full_text and not full_text.endswith(" "):
            full_text += " "
            char_time_map.append(start) # Boşluk, yeni segmentin başlangıç zamanını alsın

        # Metni ekle
        full_text += clean_text

        # 2. HATA ÇÖZÜMÜ: Anchor Mapping
        # Her harfin zamanını, içinde bulunduğu orijinal segmentin sınırlarına göre kaydet.
        for i in range(seg_len):
            char_time = start + (i * time_per_char)
            char_time_map.append(char_time)

    # NLP ile cümlelere böl
    doc = nlp(full_text)
    new_data = []

    for sent in doc.sents:
        sent_text = sent.text.strip()
        if not sent_text:
            continue

        # Cümlenin başladığı ve bittiği karakter indexleri
        start_char = sent.start_char
        end_char = sent.end_char

        # Map'ten gerçek zamanı çek (Index hatası olmaması için min/max sınırları)
        safe_start_idx = min(start_char, len(char_time_map) - 1)
        safe_end_idx = min(end_char - 1, len(char_time_map) - 1)

        real_start = char_time_map[safe_start_idx]
        real_end = char_time_map[safe_end_idx]

        new_data.append({
            "start": round(real_start, 3),
            "end": round(real_end, 3),
            "text": sent_text
        })

    return new_data

# --- TEST VERİSİ (Senin Example 1 verin) ---
json_data =[{"start":0,"end":4.320000171661377,"text":"The first time I tried cooking for someone else was an absolute disaster."},{"start":4.320000171661377,"end":8.079999923706055,"text":"I was 23 years old and had invited a girl I liked over for dinner,"},{"start":8.079999923706055,"end":11.359999656677246,"text":"thinking I could impress her with a homemade Italian meal."},{"start":11.359999656677246,"end":14.4399995803833,"text":"I had watched exactly one cooking video on YouTube and"},{"start":14.4399995803833,"end":17.81999969482422,"text":"somehow convinced myself that was enough preparation."},{"start":17.81999969482422,"end":22.719999313354492,"text":"The recipe called for fresh pasta, a simple tomato basil sauce, and"},{"start":22.719999313354492,"end":24.600000381469727,"text":"garlic bread on the side."},{"start":24.600000381469727,"end":26.719999313354492,"text":"What could possibly go wrong?"},{"start":26.719999313354492,"end":28,"text":"Well, everything."},{"start":28,"end":31.799999237060547,"text":"I started by over salting the pasta water so"},{"start":31.799999237060547,"end":34.31999969482422,"text":"badly that the noodles tasted like the ocean."},{"start":35.31999969482422,"end":38.599998474121094,"text":"Then I burned the garlic because I was too busy trying to light a candle on"},{"start":38.599998474121094,"end":41.63999938964844,"text":"the table and forgot about the pan entirely."},{"start":41.63999938964844,"end":43.91999816894531,"text":"The smoke alarm went off three times, and"},{"start":43.91999816894531,"end":47.959999084472656,"text":"by the second time my neighbor knocked on the door to ask if I needed help."},{"start":47.959999084472656,"end":50.68000030517578,"text":"The tomato sauce looked nothing like the video."},{"start":50.68000030517578,"end":52.439998626708984,"text":"It was watery, bland, and"},{"start":52.439998626708984,"end":57.08000183105469,"text":"had a strange orange color that I still cannot explain to this day."},{"start":57.08000183105469,"end":60.2400016784668,"text":"The garlic bread was somehow both burned on the outside and"},{"start":60.2400016784668,"end":64.5999984741211,"text":"cold in the middle, which I didn''t even think was physically possible."},{"start":64.5999984741211,"end":68.5199966430664,"text":"When she arrived, I panicked and told her the oven had broken and"},{"start":68.5199966430664,"end":71.44000244140625,"text":"suggested we order pizza instead."},{"start":71.44000244140625,"end":75.44000244140625,"text":"She agreed immediately, and we ended up having a wonderful evening eating"},{"start":75.44000244140625,"end":77.68000030517578,"text":"delivery pizza on the kitchen floor,"},{"start":77.68000030517578,"end":81.23999786376953,"text":"because I had also forgotten to buy proper dining chairs."},{"start":81.23999786376953,"end":85.19999694824219,"text":"She later told me she could smell the burned garlic from the hallway and"},{"start":85.19999694824219,"end":87.5199966430664,"text":"knew exactly what had happened."},{"start":87.5199966430664,"end":89.95999908447266,"text":"We laughed about it for years."},{"start":89.95999908447266,"end":93.31999969482422,"text":"That experience taught me two important lessons."},{"start":93.31999969482422,"end":97.23999786376953,"text":"First, always practice a recipe at least once before cooking it for"},{"start":97.23999786376953,"end":99.23999786376953,"text":"someone you want to impress."},{"start":99.23999786376953,"end":104.36000061035156,"text":"Second, and more importantly, the best meals are not about the food at all."},{"start":104.36000061035156,"end":107.31999969482422,"text":"They are about the company, the conversation, and"},{"start":107.31999969482422,"end":110.68000030517578,"text":"the willingness to laugh at yourself when everything falls apart."},{"start":111.63999938964844,"end":113.91999816894531,"text":"I have since become a decent cook, but"},{"start":113.91999816894531,"end":118.04000091552734,"text":"I still order pizza whenever she comes over, just for old time''s sake."}]


optimized_data = nlp_precise_align(json_data)

# Sonucu yazdır
print(json.dumps(optimized_data, indent=2, ensure_ascii=False))