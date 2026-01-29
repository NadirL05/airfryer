import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  description: "Mentions légales du site AirFryer Deal.",
};

export default function MentionsLegalesPage() {
  return (
    <div className="container max-w-3xl py-12">
      <h1 className="mb-8 text-3xl font-bold">Mentions légales</h1>
      <div className="prose prose-sm dark:prose-invert max-w-none space-y-8">
        <section>
          <h3 className="text-lg font-semibold">1. Éditeur du site</h3>
          <p>
            Le site <strong>AirFryerDeal</strong> (ci-après &quot;le Site&quot;) est édité par :<br />
            <strong>Responsables de la publication :</strong> Nadir LAHYANI et Antoine MARCHI<br />
            <strong>Adresse :</strong> 200 rue de la Croix Nivert, 75015 Paris, France<br />
            <strong>SIRET :</strong> 942 311 333 00010<br />
            <strong>Email de contact :</strong>{" "}
            <a href="mailto:nadir.lahyani@agentimpact.fr" className="hover:underline text-primary">
              nadir.lahyani@agentimpact.fr
            </a>
            <br />
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">2. Hébergement</h3>
          <p className="text-muted-foreground">
            Le Site est hébergé par Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">3. Propriété intellectuelle</h3>
          <p className="text-muted-foreground">
            L&apos;ensemble du contenu du Site (textes, images, logos, structure) est protégé par le droit d&apos;auteur et les marques déposées. Toute reproduction ou utilisation non autorisée est interdite.
          </p>
        </section>

        <section>
          <h3 className="text-lg font-semibold">4. Programme Partenaires Amazon</h3>
          <p className="text-muted-foreground">
            AirFryerDeal participe au Programme Partenaires d&apos;Amazon EU, un programme d&apos;affiliation conçu pour permettre à des sites de percevoir une rémunération grâce à des liens vers Amazon.fr. En tant que Partenaire Amazon, nous réalisons un bénéfice sur les achats remplissant les conditions requises. Les prix affichés sont indicatifs et peuvent varier.
          </p>
        </section>
      </div>
    </div>
  );
}
