#!/bin/bash
get_named_parameter() {
    local parameter_name=$1
    local default_value=$2
    if [[ -n "$default_value" ]]; then
        shift 2
    else
        shift
    fi

    local remaining_args=("$@")  # Store remaining positional parameters

    local i=0
    while [[ "$i" -lt "${#remaining_args[@]}" ]]; do
        if [[ "${remaining_args[$i]}" == "--$parameter_name" ]]; then
            # Check if the next argument is another option
            if [[ "$((i+1))" -lt "${#remaining_args[@]}" && "${remaining_args[$((i+1))]}" != "--"* ]]; then
                echo "${remaining_args[$((i+1))]}"
                return
            else
                echo "true"
                return
            fi
        fi
        ((i+=2))
    done

    if [[ -n "$default_value" ]]; then
        echo "Default value: $default_value" >&2
        echo "$default_value"
        return
    fi

    echo "Parameter $parameter_name not found" >&2
}