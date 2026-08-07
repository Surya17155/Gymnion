import asyncio
import json
import os
from pathlib import Path
from playwright.async_api import async_playwright

SCREENSHOTS = Path("/tmp/browser/attendance_tests")
SCREENSHOTS.mkdir(parents=True, exist_ok=True)

VIEWPORTS = [
    {"width": 320, "height": 600, "name": "small_mobile"},
    {"width": 375, "height": 812, "name": "iphone_x"},
    {"width": 480, "height": 900, "name": "large_mobile"},
]

async def run_test(playwright, viewport):
    browser = await playwright.chromium.launch(headless=True)
    context = await browser.new_context(viewport={"width": viewport["width"], "height": viewport["height"]})
    page = await context.new_page()
    
    # Establish origin
    await page.goto("http://localhost:8080")
    
    # Navigate to attendance
    await page.goto("http://localhost:8080/dashboard/m/attendance", wait_until="networkidle")
    
    # Wait a bit for layout
    await asyncio.sleep(1)
    
    # Take screenshot
    path = SCREENSHOTS / f"attendance_{viewport['name']}.png"
    await page.screenshot(path=str(path))
    
    # Check for horizontal overflow
    overflow_x = await page.evaluate("document.documentElement.scrollWidth > document.documentElement.clientWidth")
    
    print(f"Viewport {viewport['name']} ({viewport['width']}x{viewport['height']}): {'OVERFLOW DETECTED' if overflow_x else 'OK'}")
    
    await browser.close()

async def main():
    async with async_playwright() as playwright:
        for vp in VIEWPORTS:
            await run_test(playwright, vp)

if __name__ == "__main__":
    asyncio.run(main())
