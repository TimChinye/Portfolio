"use server";

import nodemailer from "nodemailer";
import { client } from "@/sanity/lib/client";
import { groq } from "next-sanity";

type ContactFormState = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
};

export async function submitContactForm(
  prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {

  // Anti-Bot / Honeypot Check
  const honeypot = formData.get("business_url");
  if (honeypot) {
    return { success: true, message: "Message sent successfully!" };
  }

  // Time-based check
  const startTime = Number(formData.get("start_time"));
  const now = Date.now();
  if (!startTime || now - startTime < 2000) {
     return { success: false, message: "Please verify you are human (submission too fast)." };
  }

  const variant = formData.get("variant") as string;
  const rawData = {
    name: formData.get("name") as string,
    company: formData.get("company") as string,
    reason: formData.get("reason") as string,
    opportunity: formData.get("opportunity") as string,
    location: formData.get("location") as string,
    otherLocation: formData.get("otherLocation") as string,
    compensation: formData.get("compensation") as string,
    compensationPeriod: formData.get("compensationPeriod") as string,
    hours: formData.get("hours") as string,
    schedule: formData.get("schedule") as string,
    message: formData.get("message") as string,
    email: formData.get("email") as string,
  };

  if (!rawData.email || !rawData.message || !rawData.reason || !rawData.name) {
    return { success: false, message: "Please fill in all required fields." };
  }

  try {
    let apiKey = "";
    let senderEmail = "";
    
    if (variant === 'tiger') {
        apiKey = process.env.SMTP_PASS_TIGER || "";
        senderEmail = process.env.SMTP_FROM_TIGER || "";
    } else {
        apiKey = process.env.SMTP_PASS_TIM || "";
        senderEmail = process.env.SMTP_FROM_TIM || "";
    }

    if (!apiKey || !senderEmail) {
        console.error(`Missing API Key or Sender Email for variant: ${variant}`);
        return { success: false, message: "System configuration error." };
    }
    
    const emailField = variant === 'tim' ? 'timContactEmail' : 'tigerContactEmail';
    const query = groq`*[_type == "globalContent"][0]{ ${emailField} }`;
    const sanityData = await client.fetch(query);
    
    const destinationEmail = sanityData?.[emailField];

    if (!destinationEmail) {
      console.error(`No email address configured in Sanity for variant: ${variant}`);
      return { success: false, message: "Configuration error. Please contact via social media." };
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: apiKey,
      },
    });

    const subjectToYou = `[${variant === 'tim' ? "Tim" : "Tiger"}'s Portfolio] New Inquiry from ${rawData.name}`;
    const htmlBodyToYou = generateEmailHtml(rawData, variant);
    const textBodyToYou = generateEmailText(rawData, variant);

    await transporter.sendMail({
      from: `"${rawData.name}" <${senderEmail}>`,
      replyTo: rawData.email,
      to: destinationEmail,
      subject: subjectToYou,
      text: textBodyToYou,
      html: htmlBodyToYou,
    });

    const senderName = variant === 'tim' ? 'Tim Chinye' : 'Tiger';
    const subjectToUser = `Message Received - Thanks for reaching out!`;
    const confirmationText = `Got it. Hi ${rawData.name}, This is an automated confirmation to let you know I've received your message. I'm looking forward to reading it and will get back to you as soon as possible. Best regards, ${senderName}`;
    
    const colour = {
        bg: "#F5F5EF", text: "#2F2F2B", accent: "#D9D24D",
    };
    const fonts = {
        sans: `'Figtree', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
        serif: `'Newsreader', Georgia, 'Times New Roman', serif`,
    };

    const confirmationHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap" rel="stylesheet">
        <style>
          body { margin: 0; padding: 0; background-color: ${colour.bg}; -webkit-font-smoothing: antialiased; }
        </style>
      </head>
      <body style="background-color: ${colour.bg}; padding: 40px 20px;">
        <div style="max-width: 600px; margin: 0 auto; color: ${colour.text};">
          
          <div style="margin-bottom: 40px; border-left: 4px solid ${colour.accent}; padding-left: 20px;">
            <h1 style="margin: 0; font-family: ${fonts.serif}; font-size: 32px; font-weight: 400; line-height: 1;">
              Got it.
            </h1>
            <p style="margin: 8px 0 0 0; font-family: ${fonts.sans}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">
              AUTOMATED CONFIRMATION
            </p>
          </div>

          <div style="font-family: ${fonts.sans}; font-size: 16px; line-height: 1.6;">
            <p>Hi ${rawData.name},</p>
            <p>This is to confirm I've received your message. I'm looking forward to reading it and will get back to you as soon as possible.</p>
            <p>Best regards,<br/>${senderName}</p>
          </div>

          <div style="text-align: center; opacity: 0.4; margin-top: 60px;">
            <p style="font-family: ${fonts.sans}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
              You received this after submitting the contact form on ${variant === 'tim' ? 'timchinye.com' : 'tigerfolio.com'}
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
    
    try {
        await transporter.sendMail({
            from: `"${senderName}" <${senderEmail}>`,
            to: rawData.email,
            subject: subjectToUser,
            text: confirmationText,
            html: confirmationHtml,
        });
    } catch (confirmationError) {
        console.warn("Successfully sent notification to admin, but failed to send confirmation to user:", confirmationError);
    }

    return { success: true, message: "Message sent! I'll get back to you soon." };

  } catch (error) {
    console.error("Email submission error:", error);
    return { success: false, message: "Something went wrong. Please try again later." };
  }
}

function getLabelForValue(value: string, type: 'reason' | 'opportunity') {
    const map: Record<string, string> = {
        "project": "Hire for a project",
        "full-time": "Discuss a full-time role",
        "question": "General question",
        "collaborate": "Collaboration",
        "remote": "Remote",
        "on-site": "On-site",
        "hybrid": "Hybrid"
    };
    return map[value] || value;
}

function generateEmailText(data: any, variant: string) {
  let text = `New Inquiry via ${variant === 'tim' ? "Tim Chinye" : "Tiger"} Portfolio\n`;
  text += `========================================\n\n`;
  
  text += `Name:       ${data.name}\n`;
  text += `Company:    ${data.company || "Individual"}\n`;
  text += `Email:      ${data.email}\n`;
  text += `Intent:     ${getLabelForValue(data.reason, 'reason')}\n`;

  if (['project', 'full-time', 'collaborate'].includes(data.reason)) {
    let locationStr = getLabelForValue(data.opportunity, 'opportunity');
    if (['on-site', 'hybrid'].includes(data.opportunity)) {
       const specificLoc = data.location === 'Other' ? data.otherLocation : data.location;
       locationStr += ` (${specificLoc})`;
    }
    text += `Location:   ${locationStr}\n`;
  }

  if (data.reason === 'full-time') {
    text += `Pay:        ${data.compensation} / ${data.compensationPeriod}\n`;
    text += `Hours:      ${data.hours} hrs/week\n`;
    text += `Schedule:   ${data.schedule}\n`;
  }

  text += `\nMessage:\n`;
  text += `----------------------------------------\n`;
  text += `${data.message}\n`;
  text += `----------------------------------------\n\n`;
  
  text += `(Note: Fields were extracted from a fill-in-the-blanks puzzle form, and therefore may not be formatted accurated.)`;

  return text;
}

function generateEmailHtml(data: any, variant: string) {
  const colour = {
    bg: "#F5F5EF",
    text: "#2F2F2B",
    accent: "#D9D24D",
    border: "rgba(47, 47, 43, 0.3)",
  };

  const fonts = {
    sans: `'Figtree', 'Helvetica Neue', Helvetica, Arial, sans-serif`,
    serif: `'Newsreader', Georgia, 'Times New Roman', serif`,
  };
  
  const row = (label: string, value: string) => `
    <tr>
      <td style="padding: 16px 0 4px 0; border-bottom: 2px solid ${colour.border}; vertical-align: bottom; width: 30%;">
        <span style="font-family: ${fonts.sans}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: ${colour.text}; opacity: 0.6;">
          ${label}
        </span>
      </td>
      <td style="padding: 16px 0 4px 16px; border-bottom: 2px solid ${colour.border}; vertical-align: bottom;">
        <span style="font-family: ${fonts.serif}; font-size: 18px; color: ${colour.text}; font-weight: 500; font-style: italic;">
          ${value}
        </span>
      </td>
    </tr>
  `;

  let detailsSection = "";

  if (['project', 'full-time', 'collaborate'].includes(data.reason)) {
    let locationStr = getLabelForValue(data.opportunity, 'opportunity');
    
    if (['on-site', 'hybrid'].includes(data.opportunity)) {
       locationStr += ` (${data.location === 'Other' ? data.otherLocation : data.location})`;
    }
    
    detailsSection += row("Opportunity", locationStr);
  }

  if (data.reason === 'full-time') {
    detailsSection += row("Pay", `${data.compensation} / ${data.compensationPeriod}`);
    detailsSection += row("Hours", `${data.hours} hrs/week`);
    detailsSection += row("Schedule", data.schedule);
  }

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <link href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;700&family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;1,6..72,400;1,6..72,500&display=swap" rel="stylesheet">
    <style>
      body { margin: 0; padding: 0; background-color: ${colour.bg}; -webkit-font-smoothing: antialiased; }
      a { color: ${colour.text}; text-decoration-color: ${colour.accent}; text-decoration-thickness: 2px; }
    </style>
  </head>
  <body style="background-color: ${colour.bg}; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; color: ${colour.text};">
      
      <div style="margin-bottom: 40px; border-left: 4px solid ${colour.accent}; padding-left: 20px;">
        <h1 style="margin: 0; font-family: ${fonts.serif}; font-size: 32px; font-weight: 400; line-height: 1;">
          New Inquiry
        </h1>
        <p style="margin: 8px 0 0 0; font-family: ${fonts.sans}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6;">
          VIA ${variant === 'tim' ? "TIM CHINYE" : "TIGER"} PORTFOLIO
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 50px;">
        ${row("From", data.name)}
        ${row("Company", data.company || "—")}
        ${row("Reply To", `<a href="mailto:${data.email}" style="color: ${colour.text}; text-decoration: none; border-bottom: 1px solid ${colour.accent};">${data.email}</a>`)}
          ${row("Intent", getLabelForValue(data.reason, 'reason'))}
          ${detailsSection}
        </table>

      <div style="margin-bottom: 40px;">
        <p style="font-family: ${fonts.sans}; font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; opacity: 0.6; margin-bottom: 10px;">
          MESSAGE CONTENT
        </p>
        <div style="font-family: ${fonts.serif}; font-size: 18px; line-height: 1.6; white-space: pre-wrap; background: ${colour.text}08; padding: 24px; border-radius: 4px; border-left: 2px solid ${colour.text}40;">
${data.message}
        </div>
        </div>

      <div style="text-align: center; opacity: 0.4; margin-top: 60px;">
        <p style="font-family: ${fonts.sans}; font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin: 0;">
          Sent from the Portfolio
          </p>
        </div>
    </div>
  </body>
  </html>
  `;
}