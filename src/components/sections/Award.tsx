// src/components/sections/Award.tsx
import React from "react";
import Container from "../layout/Container";
import { getPublicSettings } from "@/lib/public-settings";
import AwardClient from "./AwardClient";

const Award = async () => {
  const settings = await getPublicSettings();
  const image1 = settings.marketing_award_image_1 || "/apicta.png";
  const image2 =
    settings.marketing_award_image_2 || "/Module_Brochure_Kaizen_Draft.png";

  return <AwardClient image1={image1} image2={image2} />;
};

export default Award;
