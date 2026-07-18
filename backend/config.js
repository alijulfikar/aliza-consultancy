import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 4000,
  region: process.env.AWS_REGION || "us-east-1",
  host: process.env.PAAPI_HOST || "webservices.amazon.com",
  accessKey: process.env.AWS_ACCESS_KEY || "",
  secretKey: process.env.AWS_SECRET_KEY || "",
  partnerTag: process.env.ASSOCIATE_TAG || "",
  partnerType: "Associates",
};

export function validateConfig() {
  const missing = [];
  if (!config.accessKey) missing.push("AWS_ACCESS_KEY");
  if (!config.secretKey) missing.push("AWS_SECRET_KEY");
  if (!config.partnerTag) missing.push("ASSOCIATE_TAG");

  if (missing.length) {
    console.warn(
      "[Aliza Backend] Warning: missing required env vars:",
      missing.join(", ")
    );
  }
}

