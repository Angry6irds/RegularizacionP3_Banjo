using Sterring.Core;
using UnityEngine;
namespace Sterring.Behaviours
{
    public class Seek : SteeringBehaviour
    {
        public Transform target;

        public override Vector2 GetSteering(SterringContext ctx)
        {
            if (target == null || !enabled)
            {
                return Vector2.zero;
            }
            Vector2 targetPos = target.position;
            Vector2 desired = (targetPos - ctx.position).normalized
                * ctx.maxSpeed;
            return desired - ctx.velocity;
        }
    }
}