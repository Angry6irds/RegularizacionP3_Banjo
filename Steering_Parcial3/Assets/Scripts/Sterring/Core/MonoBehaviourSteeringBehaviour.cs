using System;
using UnityEngine;

namespace Sterring.Core
{
    [RequireComponent(typeof( SteeringController))]
    public abstract class MonoBehaviourSteeringBehaviour : MonoBehaviour
    {
        [Range(0f, 1f)]
        public float weight = 1f;
        public bool enabled = true;
        protected SteeringController controller;

        protected virtual void Awake()
        {
            controller = GetComponent<SterringController>();
            controller.RegisterMonoBehaviour(this);
        }

        protected void OnDestroy()
        {
            controller?.UnregisterMonoBehaviour(this);
        }
        public abstract Vector2 GetSteering(SterringContext ctx);
    }
}