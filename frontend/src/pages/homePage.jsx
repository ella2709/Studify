import { HomeContent } from "../components/homePageComponents";

function HomePage({
  projects,
  projectsLoading,
  projectsError,
  onCreateProject,
  onRefresh,
  onDeleteProject,
}) {
  return (
    <HomeContent
      projects={projects}
      projectsLoading={projectsLoading}
      projectsError={projectsError}
      onCreateProject={onCreateProject}
      onRefresh={onRefresh}
      onDeleteProject={onDeleteProject}
    />
  );
}

export default HomePage;