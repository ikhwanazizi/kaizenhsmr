// src/lib/email-templates/post-newsletter-template.ts

export interface PostNewsletterData {
  postTitle: string;
  postPreviewText: string;
  postImageUrl?: string | null;
  readMoreUrl: string; // e.g., https://yoursite.com/blog-articles/my-post
  unsubscribeUrl: string; // User-specific unsubscribe link
}

// We use your brand's teal color
const BRAND_COLOR = "#008080";
const BRAND_COLOR_LIGHT = "#e0f2f1";
const BRAND_COLOR_DARK = "#006666";

export const postNewsletterTemplate = (data: PostNewsletterData) => {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.postTitle}</title>
  <style>
    body { margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6; }
    table { border-collapse: collapse; }
    .container { width: 100%; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); padding: 30px; text-align: center; }
    .header h1 { color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; }
    .header p { color: ${BRAND_COLOR_LIGHT}; margin: 8px 0 0 0; font-size: 14px; }
    .image-container { padding: 0; }
    .image { width: 100%; height: auto; max-height: 300px; object-fit: cover; display: block; }
    .content { padding: 40px 30px; }
    .content h2 { color: #1f2937; margin: 0 0 20px 0; font-size: 24px; font-weight: 600; }
    .content p { color: #4b5563; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0; white-space: pre-wrap; }
    .button-container { text-align: center; padding: 10px 0; }
    .button { background: linear-gradient(135deg, ${BRAND_COLOR} 0%, ${BRAND_COLOR_DARK} 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block; }
    .footer { background-color: #f9fafb; padding: 30px; text-align: center; border-top: 1px solid #e5e7eb; }
    .footer-text { color: #6b7280; font-size: 13px; line-height: 1.6; margin: 0 0 15px 0; }
    .footer-link { color: #9ca3af; font-size: 12px; margin: 0 0 10px 0; }
    .footer-link a { color: #9ca3af; text-decoration: underline; }
  </style>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 20px 0;">
    <tr>
      <td align="center">
        <table class="container" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <h1>KaizenHR</h1>
              <p>Newsletter</p>
            </td>
          </tr>
          ${
            data.postImageUrl
              ? `
          <tr>
            <td class="image-container">
              <img src="${data.postImageUrl}" alt="Featured Image" class="image" />
            </td>
          </tr>
          `
              : ""
          }
          <tr>
            <td class="content">
              <h2>${data.postTitle}</h2>
              <p>${data.postPreviewText}</p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td class="button-container">
                    <a href="${data.readMoreUrl}" class="button">
                      Read Full Article
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin-bottom: 0;">Best regards,<br/><strong>The KaizenHR Team</strong></p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p class="footer-text">
                Suite D-05-01, 5th Floor, Block D, Plaza Mont Kiara<br/>
                50480 Kuala Lumpur, Malaysia
              </p>
              <p class="footer-link">
                You are receiving this email because you subscribed to our newsletter.
              </p>
              <p class="footer-link">
                <a href="${data.unsubscribeUrl}">Unsubscribe</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
};