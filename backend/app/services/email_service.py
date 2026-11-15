import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Dict, Any, Optional

SMTP_HOST = os.getenv("SMTP_HOST", "")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SENDER_EMAIL = os.getenv("SENDER_EMAIL", "alerts@carecircle.health")


def render_html_email(alert_type: str, context: Dict[str, Any]) -> str:
    """Renders a responsive, modern HTML email template for healthcare notifications."""
    senior_name = context.get("senior_name", "Senior")
    recipient_name = context.get("recipient_name", "Caregiver")

    if alert_type == "missed_dose_alert":
        med_name = context.get("med_name", "Medication")
        dosage = context.get("dosage", "")
        time_str = context.get("time_str", "Scheduled Time")
        instructions = context.get("instructions", "Take with water")
        emergency_phone = context.get("emergency_phone", "")

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #fee2e2; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
            .header {{ background: #dc2626; color: #ffffff; padding: 24px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 20px; font-weight: 800; }}
            .content {{ padding: 28px 24px; color: #1e293b; }}
            .alert-box {{ background: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 16px; margin: 20px 0; }}
            .med-pill {{ font-size: 18px; font-weight: 800; color: #991b1b; }}
            .meta-row {{ margin: 6px 0; font-size: 14px; color: #475569; }}
            .btn {{ display: inline-block; background: #dc2626; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin-top: 16px; }}
            .footer {{ background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚨 URGENT: Missed Medication Alert</h1>
            </div>
            <div class="content">
              <p>Hello <strong>{recipient_name}</strong>,</p>
              <p>This is an automated safety alert from <strong>CareCircle</strong>. <strong>{senior_name}</strong> has not logged their scheduled medication, and it is now past the scheduled time.</p>
              
              <div class="alert-box">
                <div class="med-pill">💊 {med_name} ({dosage})</div>
                <div class="meta-row"><strong>Scheduled Time:</strong> {time_str}</div>
                <div class="meta-row"><strong>Instructions:</strong> {instructions}</div>
                {f'<div class="meta-row"><strong>Emergency Contact Phone:</strong> {emergency_phone}</div>' if emergency_phone else ''}
              </div>

              <p>Please check in with {senior_name} or assist them with their dose immediately.</p>
              
              <center>
                <a href="http://localhost:3000" class="btn">Open CareCircle Dashboard</a>
              </center>
            </div>
            <div class="footer">
              CareCircle Elderly Care & Medication Management Platform • Automated Caregiver Escalation
            </div>
          </div>
        </body>
        </html>
        """

    elif alert_type == "upcoming_dose_reminder":
        slot = context.get("slot", "Morning").capitalize()
        medications_summary = context.get("medications_summary", "Scheduled daily prescriptions")

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #d1fae5; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
            .header {{ background: #059669; color: #ffffff; padding: 24px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 20px; font-weight: 800; }}
            .content {{ padding: 28px 24px; color: #1e293b; }}
            .reminder-box {{ background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 12px; padding: 16px; margin: 20px 0; }}
            .btn {{ display: inline-block; background: #059669; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin-top: 16px; }}
            .footer {{ background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ {slot} Medication Routine Reminder</h1>
            </div>
            <div class="content">
              <p>Hello <strong>{recipient_name}</strong>,</p>
              <p>It is time for <strong>{senior_name}&apos;s</strong> {slot} medication routine.</p>
              
              <div class="reminder-box">
                <p style="margin: 0; font-weight: 700; color: #065f46;">Scheduled Medications:</p>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #047857;">{medications_summary}</p>
              </div>

              <center>
                <a href="http://localhost:3000" class="btn">Mark as Taken in CareCircle</a>
              </center>
            </div>
            <div class="footer">
              CareCircle Elderly Care & Medication Management Platform
            </div>
          </div>
        </body>
        </html>
        """

    else:  # appointment_reminder
        doctor_name = context.get("doctor_name", "Doctor")
        specialty = context.get("specialty", "Specialist")
        hospital = context.get("hospital", "Medical Clinic")
        date_str = context.get("date_str", "Upcoming Date")
        prep_notes = context.get("prep_notes", "None")

        return f"""
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }}
            .container {{ max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #bfdbfe; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }}
            .header {{ background: #0284c7; color: #ffffff; padding: 24px; text-align: center; }}
            .header h1 {{ margin: 0; font-size: 20px; font-weight: 800; }}
            .content {{ padding: 28px 24px; color: #1e293b; }}
            .appt-box {{ background: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; padding: 16px; margin: 20px 0; }}
            .btn {{ display: inline-block; background: #0284c7; color: #ffffff !important; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 24px; border-radius: 10px; margin-top: 16px; }}
            .footer {{ background: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; }}
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🩺 Upcoming Doctor Appointment Notice</h1>
            </div>
            <div class="content">
              <p>Hello <strong>{recipient_name}</strong>,</p>
              <p>Reminder of an upcoming medical consultation for <strong>{senior_name}</strong>.</p>
              
              <div class="appt-box">
                <div style="font-weight: 800; font-size: 16px; color: #0369a1;">{doctor_name} ({specialty})</div>
                <p style="margin: 6px 0; font-size: 14px;"><strong>Date & Time:</strong> {date_str}</p>
                <p style="margin: 6px 0; font-size: 14px;"><strong>Location:</strong> {hospital}</p>
                {f'<p style="margin: 8px 0 0 0; font-size: 13px; color: #b45309; background: #fffbeb; padding: 8px; border-radius: 8px;"><strong>⚠️ Preparation Guidelines:</strong> {prep_notes}</p>' if prep_notes else ''}
              </div>

              <center>
                <a href="http://localhost:3000" class="btn">View Appointment Details</a>
              </center>
            </div>
            <div class="footer">
              CareCircle Elderly Care & Medication Management Platform
            </div>
          </div>
        </body>
        </html>
        """


def send_email_notification(
    recipient_email: str,
    subject: str,
    alert_type: str,
    context: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Sends an email notification via SMTP if credentials are provided,
    otherwise gracefully falls back to local simulation logging.
    """
    html_content = render_html_email(alert_type, context)
    text_content = f"{subject}\n\nFor: {context.get('senior_name')}\nSent to: {recipient_email}"

    # If live SMTP host is specified in environment
    if SMTP_HOST and SMTP_USER and SMTP_PASSWORD:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = SENDER_EMAIL
            msg["To"] = recipient_email

            part1 = MIMEText(text_content, "plain")
            part2 = MIMEText(html_content, "html")
            msg.attach(part1)
            msg.attach(part2)

            with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=5) as server:
                server.starttls()
                server.login(SMTP_USER, SMTP_PASSWORD)
                server.sendmail(SENDER_EMAIL, [recipient_email], msg.as_string())

            print(f"[EMAIL SERVICE] LIVE email dispatched to {recipient_email} - Subject: {subject}")
            return {"status": "sent", "subject": subject, "content": text_content}
        except Exception as e:
            print(f"[EMAIL SERVICE] SMTP dispatch failed: {e}. Falling back to simulated outbox delivery.")

    # Graceful fallback to simulation / logging for hackathon demo
    print(f"\n==================================================================")
    print(f"[EMAIL SERVICE - OUTBOX DISPATCH SIMULATION]")
    print(f"TO: {recipient_email}")
    print(f"SUBJECT: {subject}")
    print(f"TYPE: {alert_type}")
    print(f"PATIENT: {context.get('senior_name')}")
    print(f"==================================================================\n")

    return {"status": "simulated", "subject": subject, "content": text_content}
