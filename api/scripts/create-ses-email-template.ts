import { CreateEmailTemplateCommand, CreateEmailTemplateRequest, SESv2Client } from '@aws-sdk/client-sesv2';
import { config } from 'dotenv';
import { readFileSync } from 'fs';
import { resolve } from 'path';

config();

const AWS_REGION = process.env.AWS_REGION;

if (!AWS_REGION) {
    throw new Error('AWS_REGION environment variable is required.');
}

const client = new SESv2Client({ region: AWS_REGION });
const templateName = process.argv[2];
const htmlPath = process.argv[3];

if (!templateName) {
    throw new Error('Template name is required as a command-line argument.');
}

if (!htmlPath) {
    throw new Error('Path to HTML template file is required as a command-line argument.');
}

const htmlTemplate = readFileSync(resolve(htmlPath), 'utf-8');

const request: CreateEmailTemplateRequest = {
    TemplateName: templateName,
    TemplateContent: {
        Subject: 'Password Reset Request',
        Html: htmlTemplate,
    },
};

const command = new CreateEmailTemplateCommand(request);
const response = client.send(command);

response
    .then((data) => {
        console.log(`Email template created: ${JSON.stringify(data)}`);
    })
    .catch((error) => {
        console.error(`Error creating email template: ${JSON.stringify(error)}`);
    });
