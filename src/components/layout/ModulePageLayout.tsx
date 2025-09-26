// ModulePageLayout.tsx
import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import Container from "./Container";
import RelatedModulesSection from "../sections/RelatedModulesSection";

// Media types for features
type MediaType = {
  type: "image" | "video" | "icon";
  src?: string;
  alt?: string;
  icon?: string;
};

// Layout options for features
type LayoutType = "center" | "left-media" | "right-media" | "full-width";

// Enhanced CoreFeature type
type CoreFeature = {
  icon?: string;
  title: string;
  description: string;
  bgColor: string;
  media?: MediaType;
  layout?: LayoutType;
  containerClassName?: string;
  contentClassName?: string;
  titleClassName?: string;
  descriptionClassName?: string;
};

type RelatedModule = {
  name: string;
  description: string;
  link: string;
};

// Component's props interface
interface ModulePageLayoutProps {
  pageTitle: string;
  pageDescription: string;
  coreFeatures: CoreFeature[];
  relatedModules: RelatedModule[];
  heroClassName?: string;
  heroContentClassName?: string;
  children?: React.ReactNode;
}

const ModulePageLayout = ({
  pageTitle,
  pageDescription,
  coreFeatures,
  relatedModules,
  heroClassName = "bg-white",
  heroContentClassName = "py-20 text-center",
  children,
}: ModulePageLayoutProps) => {
  // Function to render media content
  const renderMedia = (media: MediaType) => {
    switch (media.type) {
      case "image":
        return (
          <img
            src={media.src}
            alt={media.alt || "Feature image"}
            className="w-full h-auto rounded-lg shadow-lg"
          />
        );
      case "video":
        return (
          <video
            src={media.src}
            controls
            className="w-full h-auto rounded-lg shadow-lg"
            poster={media.alt} // Use alt as poster if provided
          />
        );
      case "icon":
        return <div className="text-5xl mb-5">{media.icon || media.src}</div>;
      default:
        return null;
    }
  };

  // Function to render feature section based on layout
  const renderFeatureSection = (feature: CoreFeature, index: number) => {
    const layout = feature.layout || "center";

    const content = (
      <div className={feature.contentClassName || ""}>
        {!feature.media && feature.icon && (
          <div className="text-5xl mb-5">{feature.icon}</div>
        )}
        <h2
          className={`text-3xl font-bold text-gray-800 mb-4 ${
            feature.titleClassName || ""
          }`}
        >
          {feature.title}
        </h2>
        <p
          className={`max-w-3xl text-lg text-gray-600 leading-relaxed ${
            feature.descriptionClassName || ""
          }`}
        >
          {feature.description}
        </p>
      </div>
    );

    const mediaElement = feature.media ? (
      <div className="flex-1">{renderMedia(feature.media)}</div>
    ) : null;

    switch (layout) {
      case "left-media":
        return (
          <div key={index} className={feature.bgColor}>
            <Container className={feature.containerClassName || "py-20"}>
              <div className="flex flex-col lg:flex-row items-center gap-12">
                {mediaElement}
                <div className="flex-1">{content}</div>
              </div>
            </Container>
          </div>
        );

      case "right-media":
        return (
          <div key={index} className={feature.bgColor}>
            <Container className={feature.containerClassName || "py-20"}>
              <div className="flex flex-col lg:flex-row-reverse items-center gap-12">
                {mediaElement}
                <div className="flex-1">{content}</div>
              </div>
            </Container>
          </div>
        );

      case "full-width":
        return (
          <div key={index} className={feature.bgColor}>
            <div className={feature.containerClassName || "py-20"}>
              {mediaElement}
              <Container className="pt-12">
                <div className="text-center">{content}</div>
              </Container>
            </div>
          </div>
        );

      case "center":
      default:
        return (
          <div key={index} className={feature.bgColor}>
            <Container
              className={feature.containerClassName || "py-20 text-center"}
            >
              {mediaElement}
              {content}
            </Container>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Navbar />

      <main className="flex-grow">
        {/* === Hero Section === */}
        <div className={`pt-16 ${heroClassName}`}>
          <Container className={heroContentClassName}>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
              {pageTitle}
            </h1>
            <p className="max-w-3xl mx-auto text-lg text-gray-600 leading-relaxed">
              {pageDescription}
            </p>
          </Container>
        </div>

        {/* === Core Features Section === */}
        <div>
          {coreFeatures.map((feature, index) =>
            renderFeatureSection(feature, index)
          )}
        </div>

        {/* === Custom Content Slot === */}
        {children}

        {/* === Related Modules Section === */}
        <RelatedModulesSection modules={relatedModules} />
      </main>

      <Footer />
    </div>
  );
};

export default ModulePageLayout;
