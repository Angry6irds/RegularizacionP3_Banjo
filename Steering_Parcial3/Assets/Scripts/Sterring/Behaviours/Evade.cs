using Sterring.Core;
using UnityEngine;
namespace Sterring.Behaviours
{
    [System.Serializable]
    public class Evade : SteeringBehaviour
    {
        public Transform pursuer;
        public SteeringBehaviour evadeCtrl;
        public float panicDistance = 5f;

        public override Vector2 GetSteering(SterringContext ctx)
        {
            Vector2 toPursuer = (Vector2)pursuer.position - ctx.position;
            float distance = toPursuer.magnitude;

            if (distance > panicDistance)
            {
                return Vector2.zero;
            }

            float t = distance / ctx.maxSpeed;
            Vector2 futurePos = (Vector2)pursuer.position + evadeCtrl.velocity* t;
            
            Vector2 desired = (ctx.position - futurePos).normalized *  ctx.maxSpeed;
            return desired -  ctx.velocity;
        }
    }
}