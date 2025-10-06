// src/components/emails/VerificationEmail.tsx

import React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components";

interface VerificationEmailProps {
  verificationUrl: string;
}

export default function VerificationEmail({
  verificationUrl,
}: VerificationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Confirm your subscription to Kaizen's Newsletter</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Kaizen Newsletter</Heading>
          <Text style={paragraph}>
            Thanks for your interest! Please click the button below to confirm
            your subscription and verify your email address.
          </Text>
          <Button style={button} href={verificationUrl}>
            Verify Email
          </Button>
          <Text style={paragraph}>
            If you did not request this, you can safely ignore this email.
          </Text>
          <Hr style={hr} />
          <Text style={footer}>KaizenHR Sdn Bhd</Text>
        </Container>
      </Body>
    </Html>
  );
}

// Basic styles for the email
const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
};

const heading = {
  fontSize: "28px",
  fontWeight: "bold",
  marginTop: "48px",
  textAlign: "center" as const,
};

const paragraph = {
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  padding: "0 20px",
};

const button = {
  backgroundColor: "#008080",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  width: "200px",
  padding: "12px",
  margin: "20px auto",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  textAlign: "center" as const,
};
