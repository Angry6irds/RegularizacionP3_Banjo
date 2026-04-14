using UnityEngine;
namespace Sterring.Core
{
    [System.Serializable]
    public abstract class SteeringBehaviour
    {
        [Range(0f, 1f)]
        public float weight = 1f;
        public bool enabled = true;
        
        
        public abstract Vector2 GetSteering(SterringContext ctx);
    }
}