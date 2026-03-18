
#%%
import yt_dlp
import whisper
import os

# cargar modelo
model = whisper.load_model("medium")

# carpeta donde guardar los TXT
output_txt_folder = r"D:/projects/journalism/usa_iran/audio"
os.makedirs(output_txt_folder, exist_ok=True)

#%%
def descargar_audio_temporal(url):
    """
    Descarga el audio temporalmente en memoria (o en temp) solo para transcribir,
    no guardamos el WAV de manera permanente.
    """
    ydl_opts = {
        'format': 'bestaudio/best',
        'outtmpl': os.path.join(output_txt_folder, "temp_audio.%(ext)s"),
        'postprocessors': [{
            'key': 'FFmpegExtractAudio',
            'preferredcodec': 'wav',
        }],
        'quiet': True
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)
        filename = ydl.prepare_filename(info)
        audio_file = os.path.splitext(filename)[0] + ".wav"

    return audio_file, info.get("title", "transcripcion")

#%%
def transcribir_youtube(url):
    print("Procesando YouTube...")

    audio_file, title = descargar_audio_temporal(url)

    print("Transcribiendo audio...")
    result = model.transcribe(audio_file)
    texto = result["text"]

    # guardamos solo el TXT
    txt_path = os.path.join(output_txt_folder, f"{title}.txt")
    with open(txt_path, "w", encoding="utf-8") as f:
        f.write(texto)

    # borramos el audio temporal
    if os.path.exists(audio_file):
        os.remove(audio_file)

    print("\nTranscripción guardada en:", txt_path)
    return texto

#%%
# -------- EJEMPLO --------
url = "https://www.youtube.com/watch?v=wwhCcBg9mT8&list=PLcp0oK-yKIcy7JBKWYthtBIPm3doAxYwI&index=7"
transcripcion = transcribir_youtube(url)

print("\nTRANSCRIPCIÓN:\n")
print(transcripcion)
  # %%
