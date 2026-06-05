import { HomeContent } from "../components/homePageComponents";

function HomePage({
  projects,
  projectsLoading,
  projectsError,
  onCreateProject,
  onRefresh,
}) {
  return (
    <HomeContent
      projects={projects}
      projectsLoading={projectsLoading}
      projectsError={projectsError}
      onCreateProject={onCreateProject}
      onRefresh={onRefresh}
    />
  );
}

export default HomePage;