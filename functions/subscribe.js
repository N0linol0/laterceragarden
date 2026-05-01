export async function onRequestPost(context) {
  const { request, env } = context;

  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const body = await request.json();
    const { firstname, lastname, email, phone, sms_consent } = body;

    if (!email || !firstname) {
      return new Response(JSON.stringify({ error: 'Name and email are required.' }), { status: 400, headers });
    }

    if (!env.BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'API key not configured.' }), { status: 500, headers });
    }

    const contact = {
      email,
      attributes: {
        FIRSTNAME: firstname,
        LASTNAME: lastname || '',
        SMS_CONSENT: sms_consent === true,
        NEWSLETTER_CONSENT: true,
      },
      updateEnabled: true,
    };

    // Only add SMS if phone provided
    if (phone && phone.trim() !== '') {
      let cleaned = phone.replace(/\D/g, ''); // strip non-digits
      if (cleaned.length === 10) cleaned = '1' + cleaned; // add US country code
      contact.attributes.SMS = '+' + cleaned;
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contact),
    });

    const brevoBody = await brevoRes.json().catch(() => ({}));

    if (!brevoRes.ok) {
      if (brevoBody.code === 'duplicate_parameter') {
        return new Response(JSON.stringify({ success: true }), { status: 200, headers });
      }
      return new Response(JSON.stringify({ 
        error: brevoBody.message || `Brevo error ${brevoRes.status}`,
        detail: brevoBody 
      }), { status: 500, headers });
    }

    return new Response(JSON.stringify({ success: true, id: brevoBody.id }), { status: 200, headers });

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
