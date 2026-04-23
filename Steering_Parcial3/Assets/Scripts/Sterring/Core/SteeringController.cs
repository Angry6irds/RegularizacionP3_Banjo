using System.Collections.Generic;
using UnityEngine;

namespace Sterring.Core
{
    [RequireComponent(typeof(Rigidbody2D))]
    public class SteeringController : MonoBehaviour

    {
        [Header("Agent Config")] public float maxSpeed = 5f;
        public float maxForce = 3f;

        [Header("POCO Behaviours")] [SerializeReference]
        public List<SteeringBehaviour> behaviours = new();

        private readonly List<MonoBehaviourSteeringBehaviour> monoBehaviours = new();
        private Rigidbody2D rb;
        public Vector2 velocity => rb.linearVelocity;

        private void Awake() => rb = GetComponent<Rigidbody2D>();

        public void RegisterMonoBehaviour(MonoBehaviourSteeringBehaviour b) => monoBehaviours.Add(b);
        public void UnregisterMonoBehaviour(MonoBehaviourSteeringBehaviour b) => monoBehaviours.Remove(b);

        private void FixedUpdate()
        {
            Vector2 pos2d = transform.position;
            var ctx = new SterringContext(pos2d, rb.linearVelocity, maxSpeed, maxForce);
            Vector2 force = ComputeForce(ctx);
            force = Vector2.ClampMagnitude(force, maxForce);
            if (force.sqrMagnitude < 0.0001f && rb.linearVelocity.sqrMagnitude < 0.0001f)
            {
                return;
            }
            rb.AddForce(force);
            rb.linearVelocity = Vector2.ClampMagnitude(rb.linearVelocity, maxSpeed);

            if (rb.linearVelocity.sqrMagnitude > 0.01f)
            {
                float angle = Mathf.Atan2(rb.linearVelocity.y, rb.linearVelocity.x) * Mathf.Rad2Deg - 90f;
                transform.rotation = Quaternion.AngleAxis(angle, Vector3.forward);
            }
        }

        private Vector2 ComputeForce(SterringContext ctx)
        {
            Vector2 total = Vector2.zero;
            foreach (var b in behaviours)
            {
                if (b != null && b.enabled)
                {
                    total += b.GetSteering(ctx) * b.weight;
                }
            }

            foreach (var b in monoBehaviours)
            {
                if (b != null && b.enabled)
                {
                    total += b.GetSteering(ctx) * b.weight;
                }
            }

            return total;
        }
    }
}