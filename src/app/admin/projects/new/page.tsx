import { getProjectWizardOptions } from "@/app/actions/project-setup-actions";
import { ProjectWizard } from "@/components/admin/project-wizard/ProjectWizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Project — Admin",
};

export default async function NewProjectPage() {
  const result = await getProjectWizardOptions();

  const options = result.success
    ? result.data
    : {
        developers: [],
        propertyCategories: [],
        propertyTypes: [],
        projectStatuses: [],
        tenureTypes: [],
        titleTypes: [],
        regions: [],
        areas: [],
        constructionStatuses: [],
        buyerTypes: [],
      };

  return (
    <div className="min-h-0 text-white">
      <ProjectWizard options={options} />
    </div>
  );
}
