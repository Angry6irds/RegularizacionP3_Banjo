using Sterring.Core;
using UnityEngine;

namespace Sterring.Behaviours
{
    [System.Serializable]
    public class Persuit : SteeringBehaviour
    {
        /*public float distance;
        public float maxSpeed;
        public float anticipationTime;
        public Transform target;
        public Transform agent;
        public Vector2 lastPosition;
        public Vector2 futureTarget;

        public override Vector2 GetSteering(SterringContext ctx)
        {
            distance = Vector2.Distance(agent.position, target.position);
            Vector2 futurePos = new Vector2(target.position.x, target.position.y) + TargetVelocity() * anticipationTime;
            Vector2 desired = (futurePos - ctx.position).normalized * maxSpeed;
            return desired - ctx.velocity;
        }

        public Vector2 TargetVelocity()
        {
           //v = km/h
           Rigidbody2D rb = agent.GetComponent<Rigidbody2D>();
           float targetVelocity = rb.linearVelocity.magnitude;
           /*Vector2 targetVelocity = (lastPosition - futureTarget).normalized * anticipationTime;*/
        public Transform target;
        public SteeringController targetCtrl;

        public override Vector2 GetSteering(SterringContext ctx)
        {
            if (target == null || targetCtrl == null || !enabled)
            {
                return Vector2.zero;
            }
            Vector2 toTarget = (Vector2)target.position - ctx.position;
            float distance = toTarget.magnitude;

            float t = distance / ctx.maxSpeed;
            
            Vector2 futurePos = (Vector2)target.position + targetCtrl.velocity * t;
            
            Vector2 desired = (futurePos - ctx.position).normalized * ctx.maxSpeed;
            return desired - ctx.velocity;
        }
    }
}
