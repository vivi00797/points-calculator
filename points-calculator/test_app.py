from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto('http://localhost:5173')
    page.wait_for_load_state('networkidle')

    # Select model DeepSeek Chat (V3)
    page.locator('input[placeholder="搜索或选择模型..."]').click()
    page.locator('text=DeepSeek Chat (V3)').click()

    # Enter 10000 input tokens
    page.locator('input[placeholder="例如: 10000"]').fill('10000')
    page.wait_for_timeout(500)
    
    result = page.locator('.text-5xl').inner_text()
    print(f"Points result after 10000 input tokens: {result}")

    browser.close()
