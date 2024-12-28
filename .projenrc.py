from projen.python import PythonProject

project = PythonProject(
    author_email="christo.delange@sands.com",
    author_name="Christo De Lange",
    module_name="bedrock_access_gateway",
    name="bedrock-access-gateway",
    version="0.1.0",
)

project.synth()