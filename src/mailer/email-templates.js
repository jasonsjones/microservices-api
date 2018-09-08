export const passwordResetEmailHTML = resetUrl => {
    return `
        <div style="font-family: sans-serif; font-size: 18px; margin: 0 100px">
            <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
            <p>Please click on the following link, or paste into browser address bar to complete the process:</p>
            <p><a href="${resetUrl}">${resetUrl}</a></p>
            <p>If you did not request this, please disregard this email and your password will remain unchanged.</p>
        </div>
    `;
};

export const passwordResetEmailPlainText = resetUrl => {
    return `
You are receiving this because you (or someone else) have requested the reset of the password for your account.
Please click on the following link, or paste into your browser address bar to complete the process:

${resetUrl}

If you did not request this, please disregard this email and your password will remain unchanged.
`;
};

export const verifyEmailHTML = verifyUrl => {
    return `
        <div style="font-family: sans-serif; font-size: 18px; margin: 0 100px">
            <p>Thank you for registering for an account with the Sandbox API.</p>
            <p>In an effort to ensure we have a verified email address for you,
               please click on the following link, or paste into browser address
               bar to verify the email we have for you on file.</p>
            <p><a href="${verifyUrl}">${verifyUrl}</a></p>
            <p>Thank you!</p>
        </div>
    `;
};

export const verifyEmailPlainText = verifyUrl => {
    return `
Thank you for registering for an account with the Sandbox API. In an effort to ensure we have
a verified email address for you, please click on the following link, or paste into your browser
address bar to verify the email we have for you on file.

${verifyUrl}

Thank you!
`;
};
