export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { name, email, subject, message } = body;

    if (!name || !email || !subject || !message) {
      return new Response(JSON.stringify({ error: 'All fields are required.' }), { status: 400, headers });
    }

    if (!env.BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured.' }), { status: 500, headers });
    }

    const emailPayload = {
      sender: { name: 'La Tercera Garden Website', email: 'contact@laterceragarden.com' },
      to: [{ email: 'contact@laterceragarden.com', name: 'La Tercera Garden' }],
      replyTo: { email, name },
      subject: `[Contact] ${subject}`,
      htmlContent: `
        <div style="font-family: Georgia, serif; max-width: 600px; margin: 0 auto; color: #2c2416;">
          <div style="background: #1e3a2f; padding: 24px 32px;">
            <p style="color: #a8c5a0; font-family: monospace; font-size: 11px; letter-spacing: 0.2em; text-transform: uppercase; margin: 0;">La Tercera Garden — Contact Form</p>
          </div>
          <div style="padding: 32px; background: #faf7f0;">
            <table style="width: 100%; margin-bottom: 24px;">
              <tr>
                <td style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #5a4e38; padding-bottom: 4px; width: 100px;">From</td>
                <td style="font-size: 15px; color: #2c2416;">${name}</td>
              </tr>
              <tr>
                <td style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #5a4e38; padding-bottom: 4px;">Email</td>
                <td style="font-size: 15px; color: #2c2416;"><a href="mailto:${email}" style="color: #1e3a2f;">${email}</a></td>
              </tr>
              <tr>
                <td style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #5a4e38; padding-bottom: 4px;">Subject</td>
                <td style="font-size: 15px; color: #2c2416;">${subject}</td>
              </tr>
            </table>
            <div style="border-top: 1px solid #e4ddd0; padding-top: 24px;">
              <p style="font-family: monospace; font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: #5a4e38; margin-bottom: 12px;">Message</p>
              <p style="font-size: 15px; line-height: 1.8; color: #3a3020; white-space: pre-wrap;">${message}</p>
            </div>
          </div>
          <div style="background: #1e3a2f; padding: 16px 32px; text-align: center;">
            <p style="color: #3d6a52; font-family: monospace; font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; margin: 0;">Reply directly to this email to respond to ${name}</p>
          </div>
        </div>
      `,
    };

    const brevoRes = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailPayload),
    });

    const brevoBody = await brevoRes.json().catch(() => ({}));

    if (!brevoRes.ok) {
      return new Response(JSON.stringify({ error: brevoBody.message || 'Could not send message.' }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: e.message || 'Server error.' }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
