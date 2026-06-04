!/bin/bash
set -euo pipefail

ENV=${1:-dev}
CLUSTER="nimbus-cluster-${ENV}"
SERVICE="nimbus-backend-${ENV}"
REGION="us-east-1"

echo "Running migrations on ${ENV}..."

TASK_ARN=$(aws ecs list-tasks \
  --cluster "${CLUSTER}" \
  --service-name "${SERVICE}" \
  --query 'taskArns[0]' \
  --output text \
  --region "${REGION}")

if [ "${TASK_ARN}" = "None" ]; then
  echo "No running tasks found"
  exit 1
fi

echo "Running on task: ${TASK_ARN}"

aws ecs execute-command \
  --cluster "${CLUSTER}" \
  --task "${TASK_ARN}" \
  --container backend \
  --command "npx prisma migrate deploy" \
  --interactive \
  --region "${REGION}"

echo "Migration complete!"