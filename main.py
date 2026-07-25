import os
from dotenv import load_dotenv

load_dotenv()

from src.graph import app
from src.report import export_pdf


def run_pipeline(topic: str):
    os.makedirs("outputs", exist_ok=True)
    print(f"\n🚀 Running Fact-Checking Pipeline for: {topic}\n")

    try:
        final_state = app.invoke({
            "topic": topic,
            "initial_claims": [],
            "resolved_claims": [],
            "final_report": "",
        })
    except Exception as e:
        print(f"\n❌ Pipeline failed: {e}")
        print(
            "Common causes: missing/invalid GEMINI_API_KEY, missing TAVILY_API_KEY "
            "(falls back to DuckDuckGo, which rate-limits easily under the loop), "
            "or a network issue."
        )
        return

    report_md = final_state["final_report"]

    md_path = "outputs/final_report.md"
    with open(md_path, "w", encoding="utf-8") as f:
        f.write(report_md)
    print(f"\n✅ Markdown report saved to: {md_path}")

    pdf_path = "outputs/final_report.pdf"
    try:
        export_pdf(report_md, pdf_path)
        print(f"✅ PDF report saved to: {pdf_path}")
    except Exception as e:
        print(f"⚠️  PDF export skipped ({e})")


if __name__ == "__main__":
    query = input("Enter research topic or claim: ").strip()
    if not query:
        print("❌ No topic entered. Exiting.")
    else:
        run_pipeline(query)
