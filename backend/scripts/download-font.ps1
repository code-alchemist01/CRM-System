# DejaVu Sans Font İndirme Scripti
# Bu script DejaVu Sans fontunu otomatik olarak indirir ve assets/fonts klasörüne ekler

$fontUrl = "https://github.com/dejavu-fonts/dejavu-fonts/releases/download/version_2_37/dejavu-fonts-ttf-2.37.zip"
$fontDir = Join-Path $PSScriptRoot "..\assets\fonts"
$zipFile = Join-Path $env:TEMP "dejavu-fonts.zip"
$extractDir = Join-Path $env:TEMP "dejavu-fonts"

Write-Host "DejaVu Sans font indiriliyor..." -ForegroundColor Yellow

# Font klasörünü oluştur
if (-not (Test-Path $fontDir)) {
    New-Item -ItemType Directory -Path $fontDir -Force | Out-Null
}

# Font dosyası zaten varsa kontrol et
$fontFile = Join-Path $fontDir "DejaVuSans.ttf"
if (Test-Path $fontFile) {
    Write-Host "Font dosyasi zaten mevcut: $fontFile" -ForegroundColor Green
    exit 0
}

try {
    # ZIP dosyasını indir
    Write-Host "Indiriliyor: $fontUrl" -ForegroundColor Cyan
    Invoke-WebRequest -Uri $fontUrl -OutFile $zipFile -UseBasicParsing
    
    # ZIP dosyasını aç
    Write-Host "ZIP dosyasi aciliyor..." -ForegroundColor Yellow
    Expand-Archive -Path $zipFile -DestinationPath $extractDir -Force
    
    # DejaVuSans.ttf dosyasını bul ve kopyala
    $sourceFont = Get-ChildItem -Path $extractDir -Recurse -Filter "DejaVuSans.ttf" | Select-Object -First 1
    
    if ($sourceFont) {
        Copy-Item -Path $sourceFont.FullName -Destination $fontFile -Force
        Write-Host "Font basariyla yuklendi: $fontFile" -ForegroundColor Green
    } else {
        Write-Host "HATA: DejaVuSans.ttf dosyasi ZIP icinde bulunamadi!" -ForegroundColor Red
        exit 1
    }
    
    # Geçici dosyaları temizle
    Remove-Item -Path $zipFile -Force -ErrorAction SilentlyContinue
    Remove-Item -Path $extractDir -Recurse -Force -ErrorAction SilentlyContinue
    
    Write-Host "`nFont basariyla yuklendi! PDF'lerde Turkce karakterler artik dogru gorunecek." -ForegroundColor Green
} catch {
    Write-Host "HATA: Font indirilemedi: $_" -ForegroundColor Red
    Write-Host "`nManuel indirme:" -ForegroundColor Yellow
    Write-Host "1. https://dejavu-fonts.github.io/ adresine gidin" -ForegroundColor Cyan
    Write-Host "2. DejaVuSans.ttf dosyasini indirin" -ForegroundColor Cyan
    Write-Host "3. Dosyayi $fontDir klasorune kopyalayin" -ForegroundColor Cyan
    exit 1
}

