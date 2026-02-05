import json
import spacy

# Spacy modelini yükle
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    print("Model bulunamadı: python -m spacy download en_core_web_sm")
    exit()

def nlp_precise_align(data, min_gap=0.5, max_block_duration=12.0):
    """
    min_gap: İki cümle arasındaki boşluk bu değerden azsa birleştirmeyi dener.
    max_block_duration: Birleştirilen blok ASLA bu süreyi (saniye) geçemez.
    """
    full_text = ""
    char_time_map = [] 

    # --- ADIM 1: Veriyi Birleştir ve Haritala ---
    for item in data:
        text = item['text']
        start = item['start']
        end = item['end']
        duration = end - start
        
        clean_text = text.strip()
        if not clean_text:
            continue
            
        seg_len = len(clean_text)
        if seg_len == 0: continue
        
        time_per_char = duration / seg_len

        # Kelime yapışmasını önlemek için boşluk ekle
        if full_text and not full_text.endswith(" "):
            full_text += " "
            # Boşluğun zamanı bir önceki segmentin sonu olsun
            char_time_map.append(char_time_map[-1] if char_time_map else start)

        full_text += clean_text

        for i in range(seg_len):
            char_time = start + (i * time_per_char)
            char_time_map.append(char_time)

    # --- ADIM 2: NLP ile Cümlelere Böl ---
    doc = nlp(full_text)
    temp_sentences = []

    for sent in doc.sents:
        sent_text = sent.text.strip()
        if not sent_text:
            continue

        start_char = sent.start_char
        end_char = sent.end_char

        safe_start_idx = min(start_char, len(char_time_map) - 1)
        safe_end_idx = min(end_char - 1, len(char_time_map) - 1)

        real_start = char_time_map[safe_start_idx]
        real_end = char_time_map[safe_end_idx]

        temp_sentences.append({
            "start": round(real_start, 3),
            "end": round(real_end, 3),
            "text": sent_text
        })

    # --- ADIM 3: Akıllı Birleştirme (Smart Merge) ---
    if not temp_sentences:
        return []

    merged_data = []
    current_block = temp_sentences[0]

    for i in range(1, len(temp_sentences)):
        next_sent = temp_sentences[i]
        
        # 1. Kriter: Aradaki boşluk (gap) kontrolü
        gap = next_sent['start'] - current_block['end']
        
        # 2. Kriter: Eğer birleştirirsek süre çok uzuyor mu?
        # Yeni toplam süre = (Sonraki cümlenin bitişi) - (Mevcut bloğun başlangıcı)
        potential_duration = next_sent['end'] - current_block['start']

        # EĞER boşluk çok azsa VE toplam süre sınırı aşılmıyorsa -> BİRLEŞTİR
        if gap < min_gap and potential_duration < max_block_duration:
            current_block['end'] = next_sent['end']
            current_block['text'] += " " + next_sent['text']
        else:
            # Değilse, mevcut bloğu kaydet ve yenisine geç
            merged_data.append(current_block)
            current_block = next_sent
    
    # Son kalanı ekle
    merged_data.append(current_block)

    return merged_data


json_data =[
  {
    "end": 7.920000076293945,
    "text": "My name is Alex. I am from Italy. I want to talk about my favorite food. My favorite food is pizza.",
    "start": 0
  },
  {
    "end": 17.1200008392334,
    "text": "My pizza is hot and tasty. It is not cold. My pizza has cheese and tomato. It is very good.",
    "start": 7.920000076293945
  },
  {
    "end": 25.440000534057617,
    "text": "At home, I eat pizza with my family. My family likes pizza too. In the morning, I do not eat",
    "start": 17.760000228881836
  },
  {
    "end": 33.439998626708984,
    "text": "pizza. In the evening, I eat pizza. Now I ask you a question. What is your favorite food?",
    "start": 25.440000534057617
  },
  {
    "end": 36.880001068115234,
    "text": "I finish my talk and wait for your answer.",
    "start": 34.08000183105469
  }
]


optimized_data = nlp_precise_align(json_data, min_gap=0.5)

# Sonucu yazdır
print(json.dumps(optimized_data, indent=2, ensure_ascii=False))