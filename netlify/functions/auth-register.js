export const handler = async (event, context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { email, password, fullName } = JSON.parse(event.body);
    
    // Базовая валидация
    if (!email || !password) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Email и пароль обязательны' })
      };
    }

    if (password.length < 6) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Пароль должен содержать минимум 6 символов' })
      };
    }

    // Используем Netlify Identity API
    const netlifyUrl = process.env.URL || process.env.DEPLOY_URL;
    
    const response = await fetch(`${netlifyUrl}/.netlify/identity/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          full_name: fullName || ''
        }
      })
    });

    const result = await response.json();

    if (!response.ok) {
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ error: result.msg || 'Ошибка регистрации' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        success: true,
        message: 'Пользователь зарегистрирован успешно',
        user: {
          id: result.id,
          email: result.email,
          full_name: result.user_metadata?.full_name
        }
      })
    };

  } catch (error) {
    console.error('Registration error:', error);
    
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Внутренняя ошибка сервера'
      })
    };
  }
};
