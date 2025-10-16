# Sunucu Test Script
Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "BACKEND SUNUCU TEST RAPORU" -ForegroundColor Yellow
Write-Host "============================================================`n" -ForegroundColor Cyan

$baseUrl = "http://localhost:3001/api"
$testsPassed = 0
$testsFailed = 0

# Test 1: Health Check
Write-Host "Test 1: Health Check" -ForegroundColor Cyan
Write-Host "   Endpoint: GET $baseUrl/health" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/health" -Method Get -ErrorAction Stop
    if ($response.status -eq "OK") {
        Write-Host "   BASARILI - Sunucu calisiyor!" -ForegroundColor Green
        Write-Host "   Mesaj: $($response.message)`n" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "   BASARISIZ - Beklenmeyen yanit`n" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "   BASARISIZ - Sunucuya ulasilamadi!" -ForegroundColor Red
    Write-Host "   Hata: $($_.Exception.Message)`n" -ForegroundColor Red
    $testsFailed++
}

# Test 2: Login - Admin
Write-Host "Test 2: Login - Admin Kullanici" -ForegroundColor Cyan
Write-Host "   Endpoint: POST $baseUrl/auth/login" -ForegroundColor Gray
try {
    $loginData = @{
        username = "admin"
        password = "admin123"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/auth/login" -Method Post -Body $loginData -ContentType "application/json" -ErrorAction Stop
    
    if ($response.success -and $response.user.username -eq "admin") {
        Write-Host "   BASARILI - Admin girisi yapildi!" -ForegroundColor Green
        Write-Host "   Kullanici: $($response.user.name) ($($response.user.role))`n" -ForegroundColor Gray
        $testsPassed++
    } else {
        Write-Host "   BASARISIZ - Giris yapilamadi`n" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "   BASARISIZ - API hatasi!" -ForegroundColor Red
    Write-Host "   Hata: $($_.Exception.Message)`n" -ForegroundColor Red
    $testsFailed++
}

# Test 3: Kullanıcıları Listele
Write-Host "Test 3: Kullanici Listesi" -ForegroundColor Cyan
Write-Host "   Endpoint: GET $baseUrl/auth/users" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/auth/users" -Method Get -ErrorAction Stop
    
    if ($response.Count -gt 0) {
        Write-Host "   BASARILI - $($response.Count) kullanici bulundu!" -ForegroundColor Green
        $response | ForEach-Object {
            Write-Host "      - $($_.name) ($($_.username) - $($_.role))" -ForegroundColor Gray
        }
        Write-Host ""
        $testsPassed++
    } else {
        Write-Host "   BASARISIZ - Kullanici bulunamadi`n" -ForegroundColor Red
        $testsFailed++
    }
} catch {
    Write-Host "   BASARISIZ - API hatasi!" -ForegroundColor Red
    Write-Host "   Hata: $($_.Exception.Message)`n" -ForegroundColor Red
    $testsFailed++
}

# Test 4: Talepleri Listele
Write-Host "Test 4: Talep Listesi" -ForegroundColor Cyan
$requestUrl = "$baseUrl/requests?userRole=admin"
Write-Host "   Endpoint: GET $requestUrl" -ForegroundColor Gray
try {
    $response = Invoke-RestMethod -Uri $requestUrl -Method Get -ErrorAction Stop
    
    if ($response.Count -gt 0) {
        Write-Host "   BASARILI - $($response.Count) talep bulundu!" -ForegroundColor Green
        $response | Select-Object -First 3 | ForEach-Object {
            Write-Host "      - Talep #$($_.DocNum) - $($_.Reqname)" -ForegroundColor Gray
        }
        if ($response.Count -gt 3) {
            Write-Host "      ... ve $($response.Count - 3) talep daha" -ForegroundColor Gray
        }
        Write-Host ""
        $testsPassed++
    } else {
        Write-Host "   UYARI - Hic talep bulunamadi" -ForegroundColor Yellow
        Write-Host ""
        $testsPassed++
    }
} catch {
    Write-Host "   BASARISIZ - API hatasi!" -ForegroundColor Red
    Write-Host "   Hata: $($_.Exception.Message)`n" -ForegroundColor Red
    $testsFailed++
}

# Sonuç Raporu
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "TEST SONUCLARI" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

$totalTests = $testsPassed + $testsFailed
$successRate = [math]::Round(($testsPassed / $totalTests) * 100, 2)

Write-Host "   Toplam Test: $totalTests" -ForegroundColor White
Write-Host "   Basarili: $testsPassed" -ForegroundColor Green
Write-Host "   Basarisiz: $testsFailed" -ForegroundColor Red
Write-Host "   Basari Orani: %$successRate" -ForegroundColor Cyan
Write-Host ""

if ($testsFailed -eq 0) {
    Write-Host "TUM TESTLER BASARILI!" -ForegroundColor Green
    Write-Host "   Backend API tamamen calisiyor!`n" -ForegroundColor Green
} elseif ($testsPassed -gt 0) {
    Write-Host "BAZI TESTLER BASARISIZ" -ForegroundColor Yellow
    Write-Host "   Backend kismen calisiyor, bazi sorunlar var.`n" -ForegroundColor Yellow
} else {
    Write-Host "TUM TESTLER BASARISIZ" -ForegroundColor Red
    Write-Host "   Backend sunucusu calismiyor olabilir!`n" -ForegroundColor Red
}

Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "FRONTEND BAGLANTILARI" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Frontend: http://localhost:3000" -ForegroundColor White
Write-Host "   Backend API: http://localhost:3001/api" -ForegroundColor White
Write-Host "============================================================`n" -ForegroundColor Cyan
