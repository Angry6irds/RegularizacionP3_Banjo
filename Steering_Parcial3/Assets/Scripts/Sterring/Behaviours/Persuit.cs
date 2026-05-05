using Sterring.Core;
using UnityEngine;

namespace Sterring.Behaviours
{
    [System.Serializable]
    public class Persuit : SteeringBehaviour
    {
        public float distance;
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
        
        // ReSharper disable Unity.PerformanceAnalysis
        public Vector2 TargetVelocity()
        {
           //v = km/h
           /*Rigidbody2D rb = target.GetComponent<Rigidbody2D>();
           Vector2 targetVelocity = rb.linearVelocity;*/
           Vector2 targetVelocity = (futureTarget - lastPosition).normalized / Time.deltaTime;
           futureTarget = target.position;
           return targetVelocity;
        }
        
        
    }
}