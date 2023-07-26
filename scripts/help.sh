#!/bin/bash
echo_run_help(){
    echo >&2
    echo >&2
    echo >&2
    echo "___________________________   HELP   ___________________________" >&2
    echo >&2
    echo >&2
    echo >&2
    echo "Apparently your environment is not ready to run this script" >&2
    echo "There are a few things you need to do before running this script" >&2
    echo >&2
    echo >&2
    echo >&2
    echo "1. Run the script ./scripts/createEnvironmentLocalFiles.sh" >&2
    echo "2. Change volume mounts in docker-compose.volumes.local.yaml file to feet your needs" >&2
    echo "3. Override the environment variables in .env.local file to feet your needs" >&2
    echo >&2
    echo >&2
    echo >&2
    echo "4. If you never ran this environment before, else proceed to step 5" >&2
    echo "    - Run the script ./scripts/runSetup.sh" >&2
    echo >&2
    echo >&2
    echo >&2
    echo "5. Now that your environment is all set you can run as a deploy" >&2
    echo "    - Run the script ./scripts/run.sh" >&2
    echo >&2
    echo >&2
    echo >&2
    echo "Here are some scripts that can also help you clear up your environment case needed." >&2
    echo "    - Clear dangling volumes: docker volume rm $(docker volume ls -qf dangling=true)" >&2
    echo "          ./scripts/run/delete_volumes_from_docker_compose_volumes_local" >&2
    echo "    - Clear all volumes folders:" >&2
    echo "          ./scripts/run/delete_recursive_folder your_volume_absolute_path" >&2


    echo "___________________________   HELP   ___________________________" >&2

}