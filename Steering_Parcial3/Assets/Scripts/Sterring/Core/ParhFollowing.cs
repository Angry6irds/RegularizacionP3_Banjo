using Sterring.Core;
using UnityEngine;
using System.Collections.Generic;

namespace Sterring.Behaviours
{
    public class ParhFollowing : MonoBehaviourSteeringBehaviour
    {
        public List<Transform> waypoints;
        public float pathRadius;
        public float lookAheadDist;

        public override Vector2 GetSteering(SterringContext ctx)
        {
            if (!enabled || waypoints.Count == 0 || waypoints.Count < 2)
            {
                return Vector2.zero;
            }
            
            float closesDist = float.MaxValue;
            Vector2 targetLookAhead = Vector2.zero;
        }
    }
}