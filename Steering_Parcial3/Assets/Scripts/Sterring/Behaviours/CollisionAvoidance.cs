using System.Collections.Generic;
using Sterring.Core;
using UnityEngine;

namespace Sterring.Behaviours
{
    public class CollisionAvoidance : SteeringBehaviour
    {
        public Transform Agent;
        //public Transform Vecino;
        public SteeringBehaviour collisonCtrl;
        public List<Transform> vecinos = new List<Transform>();


        public override Vector2 GetSteering(SterringContext ctx)
        {
            foreach (var vecino in vecinos)
            {
                //punto 1
                SteeringController vecinoController = vecino.GetComponent<SteeringController>();
                Vector2 relPos = (Vector2)vecino.position - ctx.position;
                Vector2 relVel = vecinoController.velocity  - ctx.velocity;
                float t_min = Vector2.Dot(relPos, relVel) / Vector2.Dot(relVel, relVel);
                // punto 2
                Vector2 posA_fut = (Vector2)Agent.position + ctx.velocity * t_min;
                Vector2 posB_fut = (Vector2)vecino.position + vecinoController.velocity * t_min;
                float dist_fut =  Vector2.Distance(posA_fut, posB_fut);
                //punto 3
                Vector2 mostThreatening = dist_fut < t_min ? posB_fut : posA_fut;
                //punto 4
                

            }
            /*Vector2 relVel = Vecino
            Vector2 relPos = Vecino.position - ctx.position;
            Vector2 t_min = Vector2.Dot(relPos, relVel) / Vector2.Dot(relVel, relVel);

            Vector2 posA_fut = Agent.position - Agent.vel * t_min;
            Vector2 posB_fut = Vecino.position - Vecino.vel *  t_min;
            float dist_fut = |posA_fut - posB_fut |;*/

        }
    }
}