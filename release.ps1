$ErrorActionPreference = "Stop"
$ProgressPreference = "SilentlyContinue"

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

function Remove-ReleaseTarget {
    param(
        [Parameter(Mandatory = $true)]
        [string]$Path,
        [Parameter(Mandatory = $true)]
        [string]$ReleaseDir
    )

    if (-not (Test-Path $Path)) {
        return
    }

    $normalizedReleaseDir = [System.IO.Path]::GetFullPath($ReleaseDir).TrimEnd([System.IO.Path]::DirectorySeparatorChar, [System.IO.Path]::AltDirectorySeparatorChar)
    $normalizedTargetPath = [System.IO.Path]::GetFullPath($Path)
    $releasePrefix = $normalizedReleaseDir + [System.IO.Path]::DirectorySeparatorChar

    if (-not $normalizedTargetPath.StartsWith($releasePrefix, [System.StringComparison]::OrdinalIgnoreCase)) {
        throw "拒绝删除非RELEASE目录内容: $Path"
    }

    Remove-Item -Path $Path -Recurse -Force
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir
$frontBuildDir = Join-Path $scriptDir "dataRoomFront/front"

[xml]$pom = Get-Content -Path (Join-Path $scriptDir "pom.xml")
$version = $pom.project.version
if ([string]::IsNullOrWhiteSpace($version)) {
    throw "无法从 pom.xml 读取版本号"
}
$buildDate = Get-Date -Format "yyyyMMdd"

Write-Host "当前版本号: $version"
Write-Host "构建日期: $buildDate"

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
$releaseName = "dataRoom-$version.$buildDate"
$packageDir = Join-Path $releaseDir "dataRoom"
$packageFrontDir = Join-Path $packageDir "dataRoomFront/front"
$packageConfigDir = Join-Path $packageDir "config"
$packageResourceDir = Join-Path $packageDir "dataRoomResource"
$zipPath = Join-Path $releaseDir "$releaseName.zip"

New-Item -ItemType Directory -Path $releaseDir -Force | Out-Null
Remove-ReleaseTarget -Path $packageDir -ReleaseDir $releaseDir
Remove-ReleaseTarget -Path $zipPath -ReleaseDir $releaseDir

New-Item -ItemType Directory -Path $packageDir | Out-Null

Copy-Item -Path (Join-Path $scriptDir "dataRoomServer/target/dataRoomServer.jar") -Destination $packageDir
New-Item -ItemType Directory -Path $packageFrontDir -Force | Out-Null
Copy-Item -Path (Join-Path $frontBuildDir "*") -Destination $packageFrontDir -Recurse
New-Item -ItemType Directory -Path $packageConfigDir -Force | Out-Null
Copy-Item -Path (Join-Path $scriptDir "dataRoomServer/src/main/resources/*.yml") -Destination $packageConfigDir
New-Item -ItemType Directory -Path $packageResourceDir -Force | Out-Null

Compress-Archive -Path $packageDir -DestinationPath $zipPath -Force
Write-Host "$releaseName.zip包构建完毕"
Write-Host "部署包绝对路径: $zipPath"
Write-Host "部署教程: https://www.yuque.com/gc-starter/dataroom-plus/deploy"

Remove-Item -Path $packageDir -Recurse -Force
