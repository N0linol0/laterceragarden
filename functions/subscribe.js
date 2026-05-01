export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': 'https://laterceragarden.com',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { firstname, lastname, email, phone, sms_consent } = body;

    if (!email || !firstname) {
      return new Response(JSON.stringify({ error: 'Name and email are required.' }), { status: 400, headers });
    }

    const contact = {
      email,
      attributes: {
        FIRSTNAME: firstname,
        LASTNAME: lastname || '',
        SMS: phone || '',
        SMS_CONSENT: sms_consent === true,
        NEWSLETTER_CONSENT: true,
      },
      listIds: [2],
      updateEnabled: true,
    };

    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    if (!brevoRes.ok) {
      const err = await brevoRes.json();
      if (err.code === 'duplicate_parameter') {
        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
      }
      return new Response(JSON.stringify({ error: 'Could not save contact.' }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });

  } catch (e) {
    return new Response(JSON.stringify({ error: 'Server error.' }), { status: 500, headers });
  }
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': 'https://laterceragarden.com',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
