"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Clock, type LucideIcon, MapPin, Phone } from "lucide-react";
import { Fragment } from "react";
import { Controller, useForm } from "react-hook-form";
import { type SimpleIcon, siFacebook, siInstagram, siX } from "simple-icons";
import z from "zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

type NewsletterData = {
  title?: string;
  description?: string;
};

type NewsletterFormProps = NewsletterData;

type FooterLink = {
  text: string;
  link: string;
};

type FooterLinksSection = {
  title: string;
  items: FooterLink[];
};

interface FooterLinksSectionProps {
  sections: FooterLinksSection[];
}

type SocialLink = {
  link: string;
  icon: SimpleIcon;
};

type ContactLink = {
  icon: LucideIcon;
  text: string;
  type: LinkTypes;
  link?: string;
};

type ContactLinks = {
  contactDetails: ContactLink[];
  socialMedia: SocialLink[];
};

interface ContactSectionProps {
  links: ContactLinks;
}

interface EcommerceFooter1Props {
  newsletter: NewsletterData;
  footerLinks: FooterLinksSection[];
  contactLinks: ContactLinks;
  className?: string;
}

const LINK_TYPES = {
  NO_LINK: "NO_LINK",
  PHONE_LINK: "PHONE_LINK",
  EMAIL_LINK: "EMAIL_LINK",
};

type LinkTypes = keyof typeof LINK_TYPES;

const NEWSLETTER_DATA = {
  title: "Doaba Sports",
  description:
    "Premium Quality , English Willow - Company Graded Bats at best prices. These Bats are hand choosen by experts",
};

const FOOTER_LINKS: FooterLinksSection[] = [
  {
    title: "Our Products",
    items: [
      {
        text: "Cricket Bats",
        link: "/products/categories/cricketbats",
      },
      {
        text: "Protection Gear",
        link: "/products/categories/cricketgloves",
      },
      {
        text: "Sports Apparel",
        link: "/products/categories/cricketgear",
      },
      {
        text: "Cricket Accessories",
        link: "/products/categories/cricketaccessories",
      },
    ],
  },
  {
    title: "Collections",
    items: [
      {
        text: "New Arrivals",
        link: "#",
      },
      {
        text: "Best Sellers",
        link: "#",
      },
      {
        text: "Seasonal Edits",
        link: "#",
      },
      {
        text: "Wardrobe Essentials",
        link: "#",
      },
    ],
  },
];

const CONTACT_LINKS: ContactLinks = {
  contactDetails: [
    {
      icon: MapPin,
      text: "doabasports@gmail.com",
      link: "mailto:doabasports@gmail.com",
      type: LINK_TYPES.EMAIL_LINK as LinkTypes,
    },
    {
      icon: Phone,
      text: "+92300 8877676",
      link: "+92300 8877676",
      type: LINK_TYPES.PHONE_LINK as LinkTypes,
    },
    {
      icon: Clock,
      text: "Available 24/7 for support",
      type: LINK_TYPES.NO_LINK as LinkTypes,
    },
  ],
  socialMedia: [
    {
      icon: siFacebook,
      link: "#",
    },
    {
      icon: siX,
      link: "#",
    },
    {
      icon: siInstagram,
      link: "#",
    },
  ],
};

const EcommerceFooter1 = ({
  newsletter = NEWSLETTER_DATA,
  footerLinks = FOOTER_LINKS,
  contactLinks = CONTACT_LINKS,
  className,
}: EcommerceFooter1Props) => {
  return (
    <section className={cn("pt-8 pb-8 xl:pt-12 mx-4 md:mx-8", className)}>
      <div className="flex items-center justify-between mb-4">
        <Separator className="flex-1" />
      </div>
      <div className="container space-y-3">
        <div className="grid grid-cols-1 gap-x-16 gap-y-8 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <NewsletterSection {...newsletter} />
          </div>
          <FooterLinksSection sections={footerLinks} />
          <ContactSection links={contactLinks} />
        </div>
        <div>
          <div className="flex items-center justify-between">
            <Separator className="flex-1" />
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <p className="text-muted-foreground max-md:text-xs">
            Copyright © 2026
          </p>
          <Separator
            orientation="vertical"
            className="h-4.5! bg-foreground/60 max-sm:hidden"
          />
          <p className="max-md:text-xs">Powered by Doaba Sports</p>
        </div>
      </div>
    </section>
  );
};

const newsletterFormSchema = z.object({
  email: z.string().email(),
});

type newsletterFormType = z.infer<typeof newsletterFormSchema>;

const NewsletterSection = ({ title, description }: NewsletterFormProps) => {
  const form = useForm({
    resolver: zodResolver(newsletterFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: newsletterFormType) => {
    console.log(data);
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-serif text-3xl leading-none font-medium">
          {title}
        </h3>
        <p className="leading-normal font-light">{description}</p>
      </div>
      <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                {...field}
                aria-invalid={fieldState.invalid}
                placeholder="Email Address"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Button className="w-full">Subscribe</Button>
      </form>
    </div>
  );
};

const FooterLinksSection = ({ sections }: FooterLinksSectionProps) => {
  return (
    <Fragment>
      {sections.map(({ title, items }) => (
        <div key={crypto.randomUUID()}>
          <h2 className="mb-6 text-sm leading-tight font-medium text-muted-foreground uppercase">
            {title}
          </h2>
          <ul className="space-y-3">
            {items.map(({ text, link }) => (
              <li key={crypto.randomUUID()}>
                <a href={link} className="underline-offset-4 hover:underline">
                  {text}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </Fragment>
  );
};

const ContactSection = ({ links }: ContactSectionProps) => {
  const { socialMedia, contactDetails } = links;

  return (
    <div>
      <h2 className="mb-6 text-sm leading-tight font-medium text-muted-foreground uppercase">
        Contact
      </h2>
      <div className="space-y-6">
        <ul className="space-y-3">
          {contactDetails.map((item) => (
            <li className="flex items-center gap-3" key={crypto.randomUUID()}>
              <item.icon className="size-4 shrink-0 basis-4" />
              <div className="flex-1">
                {item.type === LINK_TYPES.NO_LINK ? (
                  <p>{item.text}</p>
                ) : (
                  <a
                    href={
                      LINK_TYPES.EMAIL_LINK
                        ? `mailto:${item.link}`
                        : `tel:${item.link}`
                    }
                    className="underline-offset-4 hover:underline"
                  >
                    {item.text}
                  </a>
                )}
              </div>
            </li>
          ))}
        </ul>
        <ul className="flex flex-wrap gap-3">
          {socialMedia.map(({ icon, link }) => (
            <li key={crypto.randomUUID()}>
              <Button size="icon-lg" variant="outline" asChild>
                <a href={link}>
                  <img
                    className="size-5 dark:hidden"
                    alt={icon.title}
                    src={`https://cdn.simpleicons.org/${icon.slug}/black`}
                  />
                  <img
                    className="hidden size-5 dark:block"
                    alt={icon.title}
                    src={`https://cdn.simpleicons.org/${icon.slug}/white`}
                  />
                </a>
              </Button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export { EcommerceFooter1, CONTACT_LINKS, NEWSLETTER_DATA, FOOTER_LINKS };
