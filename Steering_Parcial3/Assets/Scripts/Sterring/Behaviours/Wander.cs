using System;
using Sterring.Core;
using System.Collections;
using UnityEngine;
using Random = UnityEngine.Random;

namespace Sterring.Behaviours
{
    public class Wander : MonoBehaviourSteeringBehaviour
    {
        public float wanderRadius = 2f;
        public float wanderDistance = 4f;
        public float wanderJitter = 1f;
        public float updateInterval = 0.2f;
        
        private Vector2 wanderTarget;

        protected override void Awake()
        {
            base.Awake();
            wanderTarget = Random.insideUnitSphere * wanderRadius;
            wanderTarget.y = 0;
        }

        private void OnEnable()
        {
            StartCoroutine(JitterRutine());
        }

        private IEnumerator JitterRutine()
        {
            while (true)
            {
                wanderTarget += new Vector2(Random.Range(-1f, 1f) * wanderJitter, Random.Range(-1f, 1f) * wanderJitter);
                wanderTarget *= wanderTarget.normalized * wanderRadius;
                yield return new WaitForSeconds(updateInterval);
            }
        }

        public override Vector2 GetSteering(SterringContext ctx)
        {
            if (!enabled)
            {
                return Vector2.zero;
            }
            Vector2 circuleCenter = ctx.velocity.normalized * wanderDistance;
            Vector2 targetWorld = ctx.position + circuleCenter + wanderTarget;
            
            Vector2 desired = (targetWorld - ctx.position).normalized * ctx.maxSpeed;
            return desired - ctx.velocity;
        }
    }
}