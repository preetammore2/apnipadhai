import { NextResponse } from 'next/server';
import { normalizePhone } from '@/lib/validation';
import {
  sendEmailWithAttachment,
  isEmailConfigured,
  type EmailAttachment,
} from '@/lib/notifications';

const CAREERS_EMAIL = 'contact@apnipadhaipublication.com';
const RESUME_MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

export async function POST(request: Request) {
  if (!isEmailConfigured()) {
    return NextResponse.json(
      { error: 'Email service is not configured on the server.' },
      { status: 503 },
    );
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch (error) {
    console.error('[careers/apply] invalid form data', error);
    return NextResponse.json({ error: 'Invalid form submission.' }, { status: 400 });
  }

  const name = (form.get('name')?.toString() ?? '').trim();
  const phone = normalizePhone(form.get('phone'));
  const email = (form.get('email')?.toString() ?? '').trim();
  const appliedFor = (form.get('appliedFor')?.toString() ?? '').trim();
  const otherRole = (form.get('otherRole')?.toString() ?? '').trim();

  const role = appliedFor === 'Other' ? otherRole : appliedFor;

  if (!name || !phone) {
    return NextResponse.json({ error: 'Name and phone number are required.' }, { status: 400 });
  }
  if (!role) {
    return NextResponse.json(
      { error: 'Please select or type the position you are applying for.' },
      { status: 400 },
    );
  }
  if (appliedFor === 'Other' && !otherRole) {
    return NextResponse.json({ error: 'Please type the role you are applying for.' }, { status: 400 });
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 });
  }

  const file = form.get('resume');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Please upload your resume.' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: 'Resume must be a PDF or DOCX file.' },
      { status: 400 },
    );
  }
  if (file.size === 0 || file.size > RESUME_MAX_BYTES) {
    return NextResponse.json({ error: 'Resume must be under 5 MB.' }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const text = [
    'New job application received from Apni Padhai careers page.',
    '',
    `Name: ${name}`,
    `Phone: +91 ${phone}`,
    email ? `Email: ${email}` : '',
    `Applied for: ${role}`,
    '',
    'Resume attached.',
  ]
    .filter(Boolean)
    .join('\n');

  const attachments: EmailAttachment[] = [
    {
      filename: file.name,
      content: buffer,
      contentType: file.type,
    },
  ];

  const sent = await sendEmailWithAttachment(
    CAREERS_EMAIL,
    `New Career Application - ${role} - ${name}`,
    text,
    text,
    attachments,
  );

  if (!sent) {
    return NextResponse.json(
      { error: 'Could not send the application. Please try again later.' },
      { status: 500 },
    );
  }

  return NextResponse.json({ success: true });
}