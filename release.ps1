$ErrorActionPreference = "Stop"

function Get-CommandPath {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Name
    )

    $command = Get-Command $Name -ErrorAction SilentlyContinue
    if (-not $command) {
        throw "未找到命令: $Name"
    }

    return $command.Source
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
$frontBuildDir = Join-Path $scriptDir "dataRoomFront/front"

[xml]$pom = Get-Content -Path (Join-Path $scriptDir "pom.xml")
$version = $pom.project.version
if ([string]::IsNullOrWhiteSpace($version)) {
    throw "无法从 pom.xml 读取版本号"
}

Write-Host "当前版本号: $version"

$npmCommand = Get-CommandPath -Name "npm"
$mvnCommand = Get-CommandPath -Name "mvn"

Write-Host "准备打包前端"
Push-Location (Join-Path $scriptDir "dataRoomFront")
try {
    & $npmCommand run build
    if ($LASTEXITCODE -ne 0) {
        throw "前端打包失败"
    }
}
finally {
    Pop-Location
}
Write-Host "前端打包完毕"

if (-not (Test-Path $frontBuildDir -PathType Container)) {
    throw "缺少前端构建目录: $frontBuildDir"
}

Write-Host "准备打包后端"
& $mvnCommand clean package -Dmaven.test.skip=true
if ($LASTEXITCODE -ne 0) {
    throw "后端打包失败"
}
Write-Host "后端打包完毕"

Write-Host "准备构建RELEASE包"
$releaseDir = Join-Path $scriptDir "RELEASE"
$packageName = "dataRoom-$version"
$packageDir = Join-Path $releaseDir $packageName
$zipPath = Join-Path $releaseDir "$packageName.zip"

if (Test-Path $releaseDir) {
    Remove-Item -Path $releaseDir -Recurse -Force
}

New-Item -ItemType Directory -Path $packageDir | Out-Null

Copy-Item -Path (Join-Path $scriptDir "dataRoomServer/target/dataRoomServer.jar") -Destination $packageDir
New-Item -ItemType Directory -Path (Join-Path $packageDir "dataRoomFront") | Out-Null
Copy-Item -Path (Join-Path $frontBuildDir "*") -Destination (Join-Path $packageDir "dataRoomFront") -Recurse
New-Item -ItemType Directory -Path (Join-Path $packageDir "config") | Out-Null
Copy-Item -Path (Join-Path $scriptDir "dataRoomServer/src/main/resources/*.yml") -Destination (Join-Path $packageDir "config")

Compress-Archive -Path $packageDir -DestinationPath $zipPath -Force
Write-Host "$packageName.zip包构建完毕"

Remove-Item -Path $packageDir -Recurse -Force
