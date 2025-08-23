import os
import smtplib
import ssl
from email.message import EmailMessage


def send_email_smtp(to_email: str, subject: str, html: str, text: str = "") -> None:
    """Send an email using SMTP with STARTTLS."""
    host = os.getenv("SMTP_HOST", "smtp.gmail.com")
    port = int(os.getenv("SMTP_PORT", "587"))
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASS")
    mail_from = os.getenv("MAIL_FROM", user)
    app_name = os.getenv("APP_NAME", "Habee")

    if not user or not password:
        raise RuntimeError("SMTP_USER and SMTP_PASS environment variables are required")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{app_name} <{mail_from}>"
    msg["To"] = to_email

    msg.set_content(text or "")
    msg.add_alternative(html, subtype="html")

    context = ssl.create_default_context()

    with smtplib.SMTP(host, port) as server:
        server.starttls(context=context)
        server.login(user, password)
        server.send_message(msg)
