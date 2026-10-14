import { EmailSubjectEnum } from "../../enum/index.js"

export const templates = {
    [EmailSubjectEnum.CONFIRM_EMAIL]: (data) => {
        return `
    <!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.title}</title>
<style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f7f6;
        color: #333;
    }
    .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 20px;
        text-align: center;
    }
    .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
    }
    .content {
        padding: 40px 30px;
        text-align: center;
    }
    .verification-code {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        padding: 25px 40px;
        border-radius: 8px;
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 8px;
        margin: 30px 0;
        display: inline-block;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .description {
        font-size: 16px;
        line-height: 1.6;
        color: #555;
        margin-bottom: 30px;
    }
    .footer {
        background-color: #f8f9fa;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #999;
    }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.title}</h1>
        </div>
        <div class="content">
            <p class="description">Please use the code below to verify your email address:</p>
            <div class="verification-code">
                ${data.code}
            </div>
            <p class="description">If you did not create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>This is an automatically generated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>
    `
    },
    [EmailSubjectEnum.FORGOT_PASSWORD]: (data) => {
        //template for forgot password
        return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${data.title}</title>
<style>
    body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
        background-color: #f4f7f6;
        color: #333;
    }
    .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    }
    .header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        padding: 40px 20px;
        text-align: center;
    }
    .header h1 {
        color: #ffffff;
        margin: 0;
        font-size: 28px;
    }
    .content {
        padding: 40px 30px;
        text-align: center;
    }
    .verification-code {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #ffffff;
        padding: 25px 40px;
        border-radius: 8px;
        font-size: 36px;
        font-weight: bold;
        letter-spacing: 8px;
        margin: 30px 0;
        display: inline-block;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
    }
    .description {
        font-size: 16px;
        line-height: 1.6;
        color: #555;
        margin-bottom: 30px;
    }
    .footer {
        background-color: #f8f9fa;
        padding: 20px;
        text-align: center;
        font-size: 12px;
        color: #999;
    }
</style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${data.title}</h1>
        </div>
        <div class="content">
            <p class="description">Please use the code below to verify your email address:</p>
            <div class="verification-code">
                ${data.code}
            </div>
            <p class="description">If you did not create this account, please ignore this email.</p>
        </div>
        <div class="footer">
            <p>This is an automatically generated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>
`
    }
}

export const verifyEmailTemplate = (data) => {
    return templates[data.subject](data)
}