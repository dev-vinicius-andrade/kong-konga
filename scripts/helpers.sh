
create_recursive_docker_compose_volumes_local(){
  grep -oP '(?<=device: ).*' "$(pwd)/../docker-compose.volumes.local.yaml" | while read -r path; do
    if [[ ! -d "$path" ]]; then
      echo "Creating $path"
      mkdir -p "$path"
    else 
      echo "Path $path already exists do you want to delete it? [y/n]"
      read -r delete
      if [[ "$delete" == "y" ]]; then
        echo "Deleting $path"
        rm -Rf "$path"
        mkdir -p "$path"
      fi
    fi
  done
}
delete_volumes_from_docker_compose_volumes_local(){
  grep -oP '(?<=device: ).*' "$(pwd)/../docker-compose.volumes.local.yaml" | while read -r path; do
    if [[ -d "$path" ]]; then
      echo "Deleting $path"
      rm -Rf "$path"
    fi
  done
}

delete_recursive_folder(){
  local volumes_path=$1
  if [[ ! -d "$volumes_path" ]]; then
    echo "volumes_path does not exist"
    exit 0
  fi
  echo "Deleting $volumes_path"
  rm -Rf "$volumes_path"  
}
copy_file_with_overwrite_question(){
  local source_file=$1
  local destination_file=$2
  if [[ -f "$destination_file" ]]; then
    echo "$destination_file already exists do you want to overwrite it? [y/n]" >&2
    read -r answer
    if [[ "$answer" == "y" ]]; then
        echo "Ovewriting $destination_file" >&2
        cp "$source_file" "$destination_file"
    else
        echo "Exiting" >&2
        exit 0
    fi
  else
    cp "$source_file" "$destination_file"
  fi
}