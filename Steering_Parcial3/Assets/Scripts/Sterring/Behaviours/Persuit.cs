using Sterring.Core;
using UnityEngine;

namespace Sterring.Behaviours
{
    [System.Serializable]
    public class Persuit : SteeringBehaviour
    {
        public float distance;
        public float time;
        public Transform target;
        public Transform agent;

        public override Vector2 GetSteering(SterringContext ctx)
        {
            distance = Vector2.Distance(agent.position, target.position);
            time = distance / ctx.maxSpeed;
            Vector2 futureTarget = new Vector2(target.position.x, target.position.y);
            Vector2 desire = (futureTarget - agent.position);
            
        }

       /* Vector2 Persuit(Vector2 targetPos, Vector2 targerVel)
        {
            var dist = Vector2.Distance(targetPos, agent.position);
            Vector2 futureTarget = new Vector2(target.position.x, target.position.y + dist);
            return futureTarget - targetPos;
        }*/

        public void PlayerMovement(SterringContext ctx)
        {
           v = km/h 
               
               
        }
        
        
        
        
        
    }
}